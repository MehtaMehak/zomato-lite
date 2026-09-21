export const AREAS = [
  'Connaught Place',
  'Rajouri Garden',
  'Karol Bagh',
  'Majnu ka Tilla',
  'Greater Kailash',
  'Hauz Khas Village',
  'Lajpat Nagar',
  'Mehrauli',
];

export const CUISINES = ['All', 'Indian', 'North Indian', 'Chinese', 'Momos', 'Pizza', 'Cafes', 'Desserts'];

export const CUISINE_EMOJI = {
  Indian: '🍛',
  'North Indian': '🍗',
  Chinese: '🥡',
  Momos: '🥟',
  Pizza: '🍕',
  Cafes: '☕',
  Desserts: '🍰',
};

export function cuisineEmoji(cuisine) {
  return CUISINE_EMOJI[cuisine] ?? '🍽️';
}

// ---------------------------------------------------------------------------
// Client-side presentation data (no database/schema changes):
// real photo paths, price ranges and badges, keyed by the fictional names.
// ---------------------------------------------------------------------------

const PHOTO_OVERRIDES = {
  'Varuna’s Kitchen': '/photos/varunas.jpg',
  'Amritsari Brothers': '/photos/amritsari.jpg',
  'Sichuan Smoke': '/photos/sichuan.jpg',
  'Momo Mantra': '/photos/momo.jpg',
  'Piazolo Fire': '/photos/piazolo.jpg',
  'Chai Kamaal': '/photos/chaikamaal.jpg',
  'Dolly’s Dessert Studio': '/photos/dollys.jpg',
  'The Lost Recipes': '/photos/lostrecipes.jpg',
};

/** Prefer a real photo; fall back to whatever the DB stores. */
export function photoFor(restaurant) {
  return PHOTO_OVERRIDES[restaurant?.name] || restaurant?.image || '';
}

const PRICE_RANGE = {
  'Varuna’s Kitchen': '₹₹',
  'Amritsari Brothers': '₹₹',
  'Sichuan Smoke': '₹',
  'Momo Mantra': '₹',
  'Piazolo Fire': '₹₹₹',
  'Chai Kamaal': '₹₹',
  'Dolly’s Dessert Studio': '₹₹',
  'The Lost Recipes': '₹₹₹',
};

/** Estimated price range (fictional, derived client-side). */
export function priceFor(restaurant) {
  return PRICE_RANGE[restaurant?.name] ?? '₹₹';
}

/**
 * One badge per card, decided from existing data:
 * "Popular" for the most-reviewed spots, "Highly rated" otherwise.
 */
export function cardBadge(restaurant) {
  const avg = Number(restaurant?.avg_rating) || 0;
  const count = Number(restaurant?.review_count) || 0;
  if (count >= 6 && avg >= 4) return { label: 'Popular', theme: 'popular' };
  if (avg >= 4.2) return { label: 'Highly rated', theme: 'rated' };
  return null;
}

export function formatDate(value) {
  if (!value) return '';
  const normalized = String(value).trim().replace(' ', 'T') + 'Z';
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const AVATAR_COLORS = ['#e23744', '#d97706', '#0e9f6e', '#7e3af2', '#c2410c', '#0e7490', '#be185d', '#4d7c0f'];

export function avatarColor(name) {
  let sum = 0;
  for (const ch of String(name)) sum += ch.charCodeAt(0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}