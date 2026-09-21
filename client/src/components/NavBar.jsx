export default function NavBar({ onExplore, onReviews }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <button type="button" className="brand" onClick={onExplore} aria-label="Zomato Lite home">
          <span className="brand-mark" aria-hidden="true">
            z
          </span>
          <span className="brand-name">
            Zomato<em className="brand-lite"> Lite</em>
          </span>
        </button>

        <div className="nav-links">
          <button type="button" className="nav-link" onClick={onExplore}>
            Explore
          </button>
          <button type="button" className="nav-link" onClick={onReviews}>
            Reviews
          </button>
          <span className="location-pill" title="Currently browsing Delhi">
            📍 Delhi <span className="chev" aria-hidden="true">▾</span>
          </span>
        </div>
      </div>
    </nav>
  );
}