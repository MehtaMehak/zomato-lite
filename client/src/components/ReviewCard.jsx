import StarRating from './StarRating.jsx';
import { formatDate, avatarColor } from '../utils.js';

export default function ReviewCard({ review, highlight = false }) {
  const initial = (review.author || '?').trim().charAt(0).toUpperCase() || '?';

  return (
    <article className={'review-card' + (highlight ? ' review-new' : '')}>
      <div className="review-avatar" style={{ background: avatarColor(review.author) }} aria-hidden="true">
        {initial}
      </div>
      <div className="review-body">
        <div className="review-head">
          <span className="review-name">{review.author}</span>
          <time className="review-date" dateTime={review.created_at}>
            {formatDate(review.created_at)}
          </time>
        </div>
        <div className="review-stars">
          <StarRating value={review.rating} size={15} />
          <span className="review-rating-num">{review.rating}/5</span>
        </div>
        <p className="review-text">{review.comment}</p>
      </div>
    </article>
  );
}