import type { MediaType, OriginKey, ProviderKey, SortKey } from '@/types';
import { MEDIA, ORIGINS, PROVIDERS, SORTS } from '../../lib/catalog';

interface WatchProps {
  providers: ProviderKey[];
  onProvidersChange: (providers: ProviderKey[]) => void;
  original: boolean;
  onOriginalChange: (original: boolean) => void;
  searching: boolean;
}
import './Filters.css';

function WatchFilter({ providers, onProvidersChange, original, onOriginalChange, searching }: WatchProps) {
  const toggle = (key: ProviderKey) =>
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

export default function Filters({ type, onTypeChange, origin, onOriginChange, sort, onSortChange, ...watch }: {
  type: MediaType;
  onTypeChange: (type: MediaType) => void;
  origin: OriginKey | '';
  onOriginChange: (origin: OriginKey | '') => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
} & WatchProps) {
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
              onClick={() => onTypeChange(key as MediaType)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">제작 국가</span>
        <div className="segmented" role="tablist">
          {([['', { label: '전체' }], ...Object.entries(ORIGINS)] as [string, { label: string }][]).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={!watch.searching && origin === key}
              className={!watch.searching && origin === key ? 'active' : ''}
              disabled={watch.searching}
              onClick={() => onOriginChange(key as OriginKey | '')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field-label">정렬</span>
        <select value={sort} onChange={(e) => onSortChange(e.target.value as SortKey)}>
          {Object.entries(SORTS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </label>

      <WatchFilter {...watch} />
    </div>
  );
}
