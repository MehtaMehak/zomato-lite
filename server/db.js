import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(join(dataDir, 'zomato.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cuisine TEXT NOT NULL,
    address TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    author TEXT NOT NULL DEFAULT 'Anonymous',
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
`);

// Lightweight migration: add columns introduced by the Delhi redesign
// without recreating tables, so any existing reviews survive.
function ensureColumn(table, column, ddl) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

ensureColumn('restaurants', 'neighbourhood', 'neighbourhood TEXT NOT NULL DEFAULT \'\'');
ensureColumn('restaurants', 'description', 'description TEXT NOT NULL DEFAULT \'\'');
ensureColumn('restaurants', 'image', 'image TEXT NOT NULL DEFAULT \'\'');

export function listRestaurants() {
  return db
    .prepare(`
      SELECT r.id, r.name, r.cuisine, r.address, r.neighbourhood, r.description, r.image, r.created_at,
             COALESCE(AVG(v.rating), 0) AS avg_rating,
             COUNT(v.id) AS review_count
      FROM restaurants r
      LEFT JOIN reviews v ON v.restaurant_id = r.id
      GROUP BY r.id
      ORDER BY r.name ASC
    `)
    .all();
}

export function getRestaurant(id) {
  const restaurant = db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id);
  if (!restaurant) return null;

  const reviews = db
    .prepare('SELECT * FROM reviews WHERE restaurant_id = ? ORDER BY created_at DESC, id DESC')
    .all(id);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return { ...restaurant, avg_rating: avgRating, review_count: reviews.length, reviews };
}

export function createRestaurant({ name, cuisine, address, neighbourhood = '', description = '', image = '' }) {
  const result = db
    .prepare(
      'INSERT INTO restaurants (name, cuisine, address, neighbourhood, description, image) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(name, cuisine, address, neighbourhood, description, image);
  return getRestaurant(result.lastInsertRowid);
}

export function addReview(
  restaurantId,
  { author = 'Anonymous', rating, comment, createdAt } = {}
) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }
  if (typeof comment !== 'string' || !comment.trim()) {
    throw new Error('A comment is required');
  }

  const result = createdAt
    ? db
        .prepare('INSERT INTO reviews (restaurant_id, author, rating, comment, created_at) VALUES (?, ?, ?, ?, ?)')
        .run(restaurantId, author.trim() || 'Anonymous', rating, comment.trim(), createdAt)
    : db
        .prepare('INSERT INTO reviews (restaurant_id, author, rating, comment) VALUES (?, ?, ?, ?)')
        .run(restaurantId, author.trim() || 'Anonymous', rating, comment.trim());

  return db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
}