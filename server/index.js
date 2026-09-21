import express from 'express';
import cors from 'cors';

// DB_DRIVER=postgres → Neon (server/pgdb.js); anything else → SQLite (server/db.js).
const isPostgres = process.env.DB_DRIVER === 'postgres';
const db = await import(isPostgres ? './pgdb.js' : './db.js');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/restaurants', async (_req, res, next) => {
  try {
    res.json(await db.listRestaurants());
  } catch (err) {
    next(err);
  }
});

app.get('/api/restaurants/:id', async (req, res, next) => {
  try {
    const restaurant = await db.getRestaurant(Number(req.params.id));
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    next(err);
  }
});

app.post('/api/restaurants', async (req, res, next) => {
  const { name, cuisine, address, neighbourhood, description, image } = req.body ?? {};
  if (!name || !cuisine || !address) {
    return res.status(400).json({ error: 'name, cuisine and address are required' });
  }
  try {
    const restaurant = await db.createRestaurant({
      name: name.trim(),
      cuisine: cuisine.trim(),
      address: address.trim(),
      neighbourhood: (neighbourhood ?? '').trim(),
      description: (description ?? '').trim(),
      image: (image ?? '').trim(),
    });
    res.status(201).json(restaurant);
  } catch (err) {
    next(err);
  }
});

app.post('/api/restaurants/:id/reviews', async (req, res, next) => {
  try {
    const restaurant = await db.getRestaurant(Number(req.params.id));
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    try {
      const review = await db.addReview(restaurant.id, req.body ?? {});
      res.status(201).json(review);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  } catch (err) {
    next(err);
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Honour status codes set by middleware (e.g. body-parser's 400 for invalid
  // JSON) and only log genuine server-side failures.
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: err.message });
});

async function main() {
  if (typeof db.initDatabase === 'function') {
    // PostgreSQL bootstrap; the SQLite backend bootstraps itself on import.
    await db.initDatabase();
  }
  app.listen(PORT, () => {
    console.log(`Zomato Lite API listening on http://localhost:${PORT} (${isPostgres ? 'postgres' : 'sqlite'})`);
  });
}

main().catch((err) => {
  console.error('Server failed to start:', err.message);
  process.exit(1);
});