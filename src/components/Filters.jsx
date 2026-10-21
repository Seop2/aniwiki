import { MEDIA, SORTS } from '../api/tmdb';

export default function Filters({ type, onTypeChange, sort, onSortChange }) {
  return (
    <div className="filters">
      <div className="field">
        <span className="field-label">구분</span>
        <div className="segmented" role="tablist">
          {Object.entries(MEDIA).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={type === key}
              className={type === key ? 'active' : ''}
              onClick={() => onTypeChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field-label">정렬</span>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
          {Object.entries(SORTS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
