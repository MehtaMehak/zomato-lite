export default function StarRating({ value, onChange, size = 15 }) {
  const interactive = typeof onChange === 'function';
  return (
    <div
      className={'star-rating' + (interactive ? ' interactive' : '')}
      role={interactive ? 'radiogroup' : undefined}
      aria-label={interactive ? 'Rate this restaurant' : `Rated ${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={'star' + (n <= Math.round(value) ? ' filled' : '')}
          style={{ fontSize: size }}
          disabled={!interactive}
          onClick={() => interactive && onChange(n)}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? value === n : undefined}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}