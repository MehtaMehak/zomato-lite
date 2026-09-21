import { AREAS } from '../utils.js';

export default function Hero({ query, onQueryChange, area, onAreaChange, resultCount }) {
  const hasFilter = query.trim() !== '' || area !== 'All';

  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <span className="hero-eyebrow">Delhi’s food guide</span>
        <h1>
          Discover great food in <span className="accent">Delhi</span>
        </h1>
        <p className="hero-sub">
          Explore cuisines and neighbourhoods across the capital — then tell everyone exactly
          what you ordered.
        </p>

        <form
          className="search-panel"
          role="search"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Search restaurants"
        >
          <div className="search-area">
            <span className="area-pin" aria-hidden="true">
              📍
            </span>
            <select value={area} onChange={(e) => onAreaChange(e.target.value)} aria-label="Choose area">
              <option value="All">All of Delhi</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <span className="search-divider" aria-hidden="true" />

          <input
            className="search-input"
            type="search"
            placeholder="Search restaurants, cuisines, areas…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            aria-label="Search restaurants"
          />

          <button className="search-btn" type="submit">
            Search
          </button>
        </form>

        {hasFilter && (
          <p className="results-hint" role="status">
            {resultCount} place{resultCount === 1 ? '' : 's'} match your search
          </p>
        )}
      </div>
    </section>
  );
}