import { MEDIA, PROVIDERS, SORTS } from '../../lib/catalog';
import './Filters.css';

function WatchFilter({ providers, onProvidersChange, original, onOriginalChange, searching }) {
  const toggle = (key) =>
    onProvidersChange(providers.includes(key) ? providers.filter((k) => k !== key) : [...providers, key]);

  return (
    <div className="field">
      <span className="field-label">
        볼 수 있는 곳
        {searching && <span className="field-hint"> · 검색 결과에는 적용되지 않아요</span>}
      </span>
      <div className="provider-chips">
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            type="button"
            className="chip"
            aria-pressed={!searching && !original && providers.includes(p.key)}
            disabled={searching || original}
            onClick={() => toggle(p.key)}
          >
            {p.label}
          </button>
        ))}
        <i className="chip-divider" aria-hidden />
        <button
          type="button"
          className="chip chip-netflix"
          aria-pressed={original}
          disabled={searching}
          onClick={() => onOriginalChange(!original)}
        >
          넷플릭스 오리지널
        </button>
      </div>
    </div>
  );
}

export default function Filters({ type, onTypeChange, sort, onSortChange, ...watch }) {
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

      <WatchFilter {...watch} />
    </div>
  );
}
