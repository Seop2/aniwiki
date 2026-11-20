import type { MediaType, OriginKey, ProviderKey, SortKey } from "@/types";
import { toggleIn } from "@/lib/array";
import { MEDIA, ORIGINS, PROVIDERS, SORTS } from "@/lib/catalog";
import s from "./Filters.module.css";

const optionsOf = <K extends string>(obj: Record<K, { label: string }>) =>
  (Object.keys(obj) as K[]).map((key) => ({ key, label: obj[key].label }));

const TYPE_OPTIONS = optionsOf(MEDIA);
const ORIGIN_OPTIONS = [
  { key: "" as const, label: "전체" },
  ...optionsOf(ORIGINS),
];

function Segmented<K extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  options: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  disabled?: boolean;
}) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className={s.segmented} role="tablist">
        {options.map((o) => (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={!disabled && value === o.key}
            disabled={disabled}
            onClick={() => onChange(o.key)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface WatchProps {
  providers: ProviderKey[];
  onProvidersChange: (providers: ProviderKey[]) => void;
  original: boolean;
  onOriginalChange: (original: boolean) => void;
  searching: boolean;
}

function WatchFilter({
  providers,
  onProvidersChange,
  original,
  onOriginalChange,
  searching,
}: WatchProps) {
  return (
    <div className="field">
      <span className="field-label">
        볼 수 있는 곳
        {searching && (
          <span className={s.hint}> · 검색 결과에는 적용되지 않아요</span>
        )}
      </span>
      <div className={s.chips}>
        {PROVIDERS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={s.chip}
            aria-pressed={!searching && !original && providers.includes(p.key)}
            disabled={searching || original}
            onClick={() => onProvidersChange(toggleIn(providers, p.key))}
          >
            {p.label}
          </button>
        ))}
        <i className={s.divider} aria-hidden />
        <button
          type="button"
          className={`${s.chip} ${s.netflix}`}
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

export default function Filters({
  type,
  onTypeChange,
  origin,
  onOriginChange,
  sort,
  onSortChange,
  ...watch
}: {
  type: MediaType;
  onTypeChange: (type: MediaType) => void;
  origin: OriginKey | "";
  onOriginChange: (origin: OriginKey | "") => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
} & WatchProps) {
  return (
    <div className={s.filters}>
      <Segmented
        label="구분"
        options={TYPE_OPTIONS}
        value={type}
        onChange={onTypeChange}
      />

      <Segmented
        label="제작 국가"
        options={ORIGIN_OPTIONS}
        value={origin}
        onChange={onOriginChange}
        disabled={watch.searching}
      />

      <label className="field">
        <span className="field-label">정렬</span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          {Object.entries(SORTS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <WatchFilter {...watch} />
    </div>
  );
}
