const BASE = '/api';

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export function fetchRestaurants() {
  return request(`${BASE}/restaurants`);
}

export function fetchRestaurant(id) {
  return request(`${BASE}/restaurants/${id}`);
}

export function submitReview(id, review) {
  return request(`${BASE}/restaurants/${id}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
}