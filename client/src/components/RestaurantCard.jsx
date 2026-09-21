import RestaurantImage from './RestaurantImage.jsx';
import { cuisineEmoji, priceFor, photoFor, cardBadge } from '../utils.js';

export default function RestaurantCard({ restaurant, onOpen }) {
  const badge = cardBadge(restaurant);

  return (
    <article
      className="card"
      onClick={() => onOpen(restaurant.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(restaurant.id);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View ${restaurant.name}`}
    >
      <div className="card-media">
        <RestaurantImage
          className="card-img"
          src={photoFor(restaurant)}
          alt={`${restaurant.name} — ${restaurant.cuisine}`}
          emoji={cuisineEmoji(restaurant.cuisine)}
        />
        {badge && <span className={`card-badge ${badge.theme}`}>{badge.label}</span>}
        <span className="rating-chip">
          <span className="star-glyph" aria-hidden="true">
            ★
          </span>
          {Number(restaurant.avg_rating).toFixed(1)}
        </span>
      </div>

      <div className="card-body">
        <h3 className="card-title">{restaurant.name}</h3>
        <p className="card-sub">📍 {restaurant.neighbourhood || 'Delhi'}</p>

        <div className="card-tags">
          <span className="tag-cuisine">{restaurant.cuisine}</span>
          <span className="tag-price" title="Estimated price range">
            {priceFor(restaurant)}
          </span>
        </div>

        <div className="card-meta">
          <span>
            {restaurant.review_count} review{restaurant.review_count === 1 ? '' : 's'}
          </span>
          <span className="card-view">View →</span>
        </div>
      </div>
    </article>
  );
}