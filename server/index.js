import express from 'express';
import cors from 'cors';
import { listRestaurants, getRestaurant, createRestaurant, addReview } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/restaurants', (_req, res) => {
  res.json(listRestaurants());
});

app.get('/api/restaurants/:id', (req, res) => {
  const restaurant = getRestaurant(Number(req.params.id));
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
  res.json(restaurant);
});

app.post('/api/restaurants', (req, res) => {
  const { name, cuisine, address, neighbourhood, description, image } = req.body ?? {};
  if (!name || !cuisine || !address) {
    return res.status(400).json({ error: 'name, cuisine and address are required' });
  }
  const restaurant = createRestaurant({
    name: name.trim(),
    cuisine: cuisine.trim(),
    address: address.trim(),
    neighbourhood: (neighbourhood ?? '').trim(),
    description: (description ?? '').trim(),
    image: (image ?? '').trim(),
  });
  res.status(201).json(restaurant);
});

app.post('/api/restaurants/:id/reviews', (req, res) => {
  const restaurant = getRestaurant(Number(req.params.id));
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

  try {
    const review = addReview(restaurant.id, req.body ?? {});
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Zomato Lite API listening on http://localhost:${PORT}`);
});