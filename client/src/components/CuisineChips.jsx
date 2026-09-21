import { CUISINES } from '../utils.js';

export default function CuisineChips({ active, onChange }) {
  return (
    <div className="chips" role="group" aria-label="Filter by cuisine">
      {CUISINES.map((c) => (
        <button
          key={c}
          type="button"
          className={'chip' + (active === c ? ' active' : '')}
          onClick={() => onChange(c)}
          aria-pressed={active === c}
        >
          {c}
        </button>
      ))}
    </div>
  );
}