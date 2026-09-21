import { useEffect, useMemo, useRef, useState } from 'react';
import RestaurantImage from './RestaurantImage.jsx';
import ReviewCard from './ReviewCard.jsx';
import ReviewForm from './ReviewForm.jsx';
import StarRating from './StarRating.jsx';
import { cuisineEmoji, photoFor, priceFor } from '../utils.js';

export default function RestaurantDetail({ restaurant, onBack, onReview }) {
  const rating = Number(restaurant.avg_rating) || 0;
  const count = Number(restaurant.review_count) || 0;
  const reviews = restaurant.reviews ?? [];

  // Briefly highlight the review that was just submitted.
  const [newReviewId, setNewReviewId] = useState(null);
  const prevFirstId = useRef(null);
  useEffect(() => {
    const firstId = reviews[0]?.id;
    if (prevFirstId.current === null) {
      prevFirstId.current = firstId;
    } else if (prevFirstId.current !== firstId) {
      prevFirstId.current = firstId;
      setNewReviewId(firstId);
      const timer = setTimeout(() => setNewReviewId(null), 900);
      return () => clearTimeout(timer);
    }
  }, [reviews]);

  const distribution = useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((star) => ({ star, n: 0 }));
    for (const r of reviews) {
      const bucket = buckets.find((b) => b.star === Number(r.rating));
      if (bucket) bucket.n += 1;
    }
    const total = reviews.length || 1;
    return buckets.map((b) => ({ ...b, pct: Math.round((b.n / total) * 100) }));
  }, [reviews]);

  return (
    <section className="detail">
      <button type="button" className="detail-back" onClick={onBack}>
        ← Back to all restaurants
      </button>

      <div className="cover">
        <RestaurantImage
          className="cover-img"
          src={photoFor(restaurant)}
          alt={`${restaurant.name} — ${restaurant.cuisine}`}
          emoji={cuisineEmoji(restaurant.cuisine)}
        />
        <div className="cover-overlay">
          <div className="cover-badges">
            <span className="cover-badge">{restaurant.cuisine}</span>
            <span className="cover-badge">📍 {restaurant.neighbourhood || 'Delhi'}</span>
            <span className="cover-badge price" title="Estimated range for a meal for two">
              {priceFor(restaurant)}
            </span>
          </div>
          <h2 className="cover-title">{restaurant.name}</h2>
          <div className="cover-rating">
            <span className="rating-chip">
              <span className="star-glyph" aria-hidden="true">
                ★
              </span>
              {rating.toFixed(1)}
            </span>
            <span className="cover-count">
              {count} review{count === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      <div className="info-card">
        <div className="info-grid">
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              🍽️
            </span>
            <div>
              <div className="info-label">Cuisine</div>
              <div className="info-value">{restaurant.cuisine}</div>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              📍
            </span>
            <div>
              <div className="info-label">Neighbourhood</div>
              <div className="info-value">{restaurant.neighbourhood || 'Delhi'}</div>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              🏠
            </span>
            <div>
              <div className="info-label">Address</div>
              <div className="info-value">{restaurant.address}</div>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon" aria-hidden="true">
              💰
            </span>
            <div>
              <div className="info-label">Price range</div>
              <div className="info-value">
                {priceFor(restaurant)} <span className="price-detail">meal for two</span>
              </div>
            </div>
          </div>
        </div>
        {restaurant.description && <p className="description">{restaurant.description}</p>}
      </div>

      <div className="detail-grid">
        <div className="reviews-col" id="reviews">
          <section className="rating-summary" aria-label="Rating summary">
            <div className="rating-summary-main">
              <div className="rating-big">
                {rating.toFixed(1)}
                <small>/5</small>
              </div>
              <div>
                <StarRating value={rating} size={17} />
                <p className="rating-sub">
                  Based on {count} review{count === 1 ? '' : 's'}
                </p>
              </div>
            </div>
            <ul className="rating-bars">
              {distribution.map((b) => (
                <li key={b.star} className="bar-row">
                  <span className="bar-star">
                    {b.star}
                    <span aria-hidden="true">★</span>
                  </span>
                  <span className="bar-track">
                    <span className="bar-fill" style={{ width: `${b.pct}%` }} />
                  </span>
                  <span className="bar-count">{b.n}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="reviews-head">
            <h3>Reviews</h3>
            <span className="count-pill">{count}</span>
          </div>

          {reviews.length === 0 ? (
            <p className="muted">Be the first to review this place!</p>
          ) : (
            <ul className="reviews-list">
              {reviews.map((r) => (
                <li key={r.id}>
                  <ReviewCard review={r} highlight={r.id === newReviewId} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <ReviewForm restaurantName={restaurant.name} onSubmit={onReview} />
      </div>
    </section>
  );
}