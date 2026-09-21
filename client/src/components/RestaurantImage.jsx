import { useState } from 'react';

export default function RestaurantImage({ src, alt, emoji = '🍽️', className = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`image-fallback ${className}`} role="img" aria-label={alt}>
        <span className="fallback-emoji" aria-hidden="true">
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}