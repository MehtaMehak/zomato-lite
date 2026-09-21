import { useEffect, useMemo, useState } from 'react';
import { fetchRestaurants, fetchRestaurant, submitReview } from './api.js';
import NavBar from './components/NavBar.jsx';
import Hero from './components/Hero.jsx';
import CuisineChips from './components/CuisineChips.jsx';
import RestaurantCard from './components/RestaurantCard.jsx';
import RestaurantDetail from './components/RestaurantDetail.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  const [restaurants, setRestaurants] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState('All');
  const [area, setArea] = useState('All');

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!restaurants) return [];
    const q = query.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (cuisine !== 'All' && r.cuisine !== cuisine) return false;
      if (area !== 'All' && r.neighbourhood !== area) return false;
      if (!q) return true;
      return [r.name, r.cuisine, r.neighbourhood, r.address].join(' ').toLowerCase().includes(q);
    });
  }, [restaurants, query, cuisine, area]);

  const popular = useMemo(() => {
    if (!restaurants) return [];
    return [...restaurants].sort((a, b) => b.review_count - a.review_count).slice(0, 3);
  }, [restaurants]);

  const hasFilter = query.trim() !== '' || cuisine !== 'All' || area !== 'All';

  function scrollToId(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleExplore() {
    setSelected(null);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function handleReviews() {
    if (selected) {
      scrollToId('reviews');
    } else {
      scrollToId('popular');
    }
  }

  async function openRestaurant(id) {
    try {
      setSelected(await fetchRestaurant(id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleReview(review) {
    const created = await submitReview(selected.id, review);
    setSelected((prev) => {
      const newCount = prev.review_count + 1;
      const newAvg = (prev.avg_rating * prev.review_count + created.rating) / newCount;
      return {
        ...prev,
        reviews: [created, ...prev.reviews],
        review_count: newCount,
        avg_rating: newAvg,
      };
    });
  }

  if (error) {
    return (
      <div className="app">
        <NavBar onExplore={handleExplore} onReviews={handleReviews} />
        <main className="container">
          <p className="error center">Couldn’t load restaurants — {error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app">
      <NavBar onExplore={handleExplore} onReviews={handleReviews} />

      {selected ? (
        <main className="container">
          <RestaurantDetail restaurant={selected} onBack={() => setSelected(null)} onReview={handleReview} />
        </main>
      ) : (
        <main>
          <Hero
            query={query}
            onQueryChange={setQuery}
            area={area}
            onAreaChange={setArea}
            resultCount={filtered.length}
          />

          <div className="container">
            <section className="discover" aria-label="Browse restaurants">
              <CuisineChips active={cuisine} onChange={setCuisine} />

              {restaurants === null ? (
              <p className="loading">Loading restaurants in Delhi…</p>
            ) : hasFilter ? (
              <section className="section" id="results">
                <div className="section-head">
                  <div>
                    <h2 className="section-title">{filtered.length ? 'Results' : 'No matches'}</h2>
                    {filtered.length > 0 && (
                      <p className="section-sub">Showing {filtered.length} place{filtered.length === 1 ? '' : 's'}</p>
                    )}
                  </div>
                  {(query || cuisine !== 'All' || area !== 'All') && (
                    <button
                      type="button"
                      className="see-all"
                      onClick={() => {
                        setQuery('');
                        setCuisine('All');
                        setArea('All');
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                {filtered.length === 0 ? (
                  <p className="empty">Nothing matched. Try another search or clear the filters.</p>
                ) : (
                  <div className="grid">
                    {filtered.map((r) => (
                      <RestaurantCard key={r.id} restaurant={r} onOpen={openRestaurant} />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <>
                <section className="section" id="popular">
                  <div className="section-head">
                    <div>
                      <h2 className="section-title">Popular in Delhi</h2>
                      <p className="section-sub">Most-reviewed spots across the city right now</p>
                    </div>
                    <button type="button" className="see-all" onClick={() => scrollToId('restaurants')}>
                      See all →
                    </button>
                  </div>
                  <div className="grid">
                    {popular.map((r) => (
                      <RestaurantCard key={r.id} restaurant={r} onOpen={openRestaurant} />
                    ))}
                  </div>
                </section>

                <section className="section" id="restaurants">
                  <div className="section-head">
                    <div>
                      <h2 className="section-title">All restaurants</h2>
                      <p className="section-sub">Every listing, across every neighbourhood</p>
                    </div>
                  </div>
                  <div className="grid">
                    {restaurants.map((r) => (
                      <RestaurantCard key={r.id} restaurant={r} onOpen={openRestaurant} />
                    ))}
                  </div>
                </section>
              </>
                )}
              </section>
            </div>
        </main>
      )}

      <Footer />
    </div>
  );
}