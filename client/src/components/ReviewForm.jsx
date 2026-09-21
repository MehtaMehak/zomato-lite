import { useState } from 'react';
import StarRating from './StarRating.jsx';

const RATING_LABELS = {
  1: '1 — Avoid',
  2: '2 — Meh',
  3: '3 — Decent',
  4: '4 — Very good',
  5: '5 — Must visit!',
};

export default function ReviewForm({ restaurantName, onSubmit }) {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!rating) return setError('Please tap a star to rate your meal.');
    if (!comment.trim()) return setError('Please write a few words about your meal.');

    setSubmitting(true);
    try {
      await onSubmit({
        author: author.trim(),
        rating,
        comment: comment.trim(),
      });
      setAuthor('');
      setRating(0);
      setComment('');
      setNotice('Thanks! Your review has been added.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3 className="form-title">Write a review</h3>
      <p className="form-sub">
        Share your experience at {restaurantName || 'this place'} — it helps fellow Delhi foodies.
      </p>

      {error && (
        <p className="form-msg error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="form-msg success" role="status">
          {notice}
        </p>
      )}

      <div className="field">
        <label className="field-label" htmlFor="review-author">
          Your name (optional)
        </label>
        <input
          id="review-author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. Priya Sharma"
          maxLength={60}
          autoComplete="name"
        />
      </div>

      <div className="field">
        <span className="field-label" id="review-rating-label">
          Your rating
        </span>
        <div className="star-row">
          <StarRating value={rating} onChange={setRating} size={32} />
        </div>
        <p className="star-hint">
          <span>Tap a star to rate</span>
          {rating > 0 && <span className="star-value">{RATING_LABELS[rating]}</span>}
        </p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="review-comment">
          How was your meal?
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder={`Tell us about ${restaurantName || 'this place'}…`}
        />
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}