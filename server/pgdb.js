import pg from 'pg';
import net from 'node:net';

// node-postgres returns BIGINT (int8, OID 20) and NUMERIC (1700) columns as
// strings. The API contract expects plain JSON numbers (matching SQLite).
pg.types.setTypeParser(20, parseInt); // int8 -> number
pg.types.setTypeParser(1700, parseFloat); // numeric -> number (defensive)

const rawUrl = process.env.DATABASE_URL ?? '';
if (!rawUrl) {
  throw new Error('DATABASE_URL is not set — required when DB_DRIVER=postgres. Check your .env file.');
}

// node-postgres does not understand libpq-only parameters. `channel_binding`
// is irrelevant to the pg driver, so drop it to avoid connection errors.
const connectionString = rawUrl
  .replace(/&channel_binding=[^&]*/gi, '')
  .replace(/\?channel_binding=[^&]*/gi, '?');

// Never log the connection string itself — it contains credentials.
const requiresSsl =
  /sslmode=(require|verify-ca|verify-full)(?:&|$)/i.test(rawUrl) ||
  /^postgres(ql)?:\/\//i.test(rawUrl);

const { Pool } = pg;

// pg calls socket.connect(port, host) with positional arguments, so net options
// placed in the Pool config (family, autoSelectFamily) are ignored. Node's
// Happy Eyeballs limits each address attempt to ~250ms, which is too short for
// some networks (and for cold Neon pooler endpoints), producing ETIMEDOUT even
// though a plain TCP connect would succeed. Supplying our own socket pins IPv4
// and lets the OS-level connect timeout do its job. TLS is still negotiated by
// pg on top of this socket.
function createIpv4Socket() {
  const socket = new net.Socket();
  const connect = socket.connect.bind(socket);
  socket.connect = (port, host) => connect({ port, host, family: 4, autoSelectFamily: false });
  return socket;
}

export const pool = new Pool({
  connectionString,
  // Neon requires TLS. rejectUnauthorized:false sidesteps local CA-bundle
  // quirks on Windows for the dev setup.
  ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
  stream: createIpv4Socket,
  max: 10,
  idleTimeoutMillis: 30_000,
  // Neon pauses idle computes; the first connection can take a while to wake.
  connectionTimeoutMillis: 60_000,
});

export async function initDatabase() {
  // Idempotent schema bootstrap. created_at is TEXT with the same
  // 'YYYY-MM-DD HH:MM:SS' wire format SQLite produces, so the frontend's
  // formatDate() keeps working unchanged.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      cuisine TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (to_char(now(), 'YYYY-MM-DD HH:MM:SS')),
      neighbourhood TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      restaurant_id BIGINT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
      author TEXT NOT NULL DEFAULT 'Anonymous',
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (to_char(now(), 'YYYY-MM-DD HH:MM:SS'))
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
  `);
}

export async function listRestaurants() {
  const { rows } = await pool.query(`
    SELECT r.id::int AS id, r.name, r.cuisine, r.address, r.neighbourhood, r.description, r.image, r.created_at,
           COALESCE(AVG(v.rating)::float8, 0) AS avg_rating,
           COUNT(v.id)::int AS review_count
    FROM restaurants r
    LEFT JOIN reviews v ON v.restaurant_id = r.id
    GROUP BY r.id
    ORDER BY r.name ASC
  `);
  return rows;
}

export async function getRestaurant(id) {
  const { rows: restaurantRows } = await pool.query(
    'SELECT * FROM restaurants WHERE id = $1',
    [id]
  );
  if (restaurantRows.length === 0) return null;
  const restaurant = restaurantRows[0];

  const { rows: reviews } = await pool.query(
    'SELECT * FROM reviews WHERE restaurant_id = $1 ORDER BY created_at DESC, id DESC',
    [id]
  );

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
    : 0;

  return { ...restaurant, avg_rating: avgRating, review_count: reviews.length, reviews };
}

export async function createRestaurant({ name, cuisine, address, neighbourhood = '', description = '', image = '' }) {
  const { rows } = await pool.query(
    `INSERT INTO restaurants (name, cuisine, address, neighbourhood, description, image)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [name, cuisine, address, neighbourhood, description, image]
  );
  return getRestaurant(rows[0].id);
}

export async function addReview(restaurantId, { author = 'Anonymous', rating, comment, createdAt } = {}) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }
  if (typeof comment !== 'string' || !comment.trim()) {
    throw new Error('A comment is required');
  }

  const values = [restaurantId, author.trim() || 'Anonymous', rating, comment.trim()];
  let sql = 'INSERT INTO reviews (restaurant_id, author, rating, comment';
  if (createdAt) {
    sql += ', created_at';
    values.push(createdAt);
  }
  sql += ') VALUES ($1, $2, $3, $4' + (createdAt ? ', $5' : '') + ') RETURNING *';

  const { rows } = await pool.query(sql, values);
  return rows[0];
}