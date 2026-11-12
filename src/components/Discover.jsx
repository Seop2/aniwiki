import { useEffect, useState } from 'react';
import { posterUrl } from '../api/tmdb';
import { SEEDS, SEED_BY_ID } from '../data/seeds';
import { discoverPath } from '../lib/discover';
import { detailPath, isPlainClick } from '../lib/router';
import { useAnimeDetail } from '../hooks/useAnimeDetail';
import { useHiddenGems } from '../hooks/useHiddenGems';
import { useDiscoverPicks, useSeen } from '../hooks/useSeen';

const RECOMMENDED_PICKS = 3;

function SeedPicker({ picks, onToggle, onSubmit }) {
  return (
    <section className="discover">
      <div className="list-head discover-head">
        <div>
          <p className="eyebrow">DISCOVER · HIDDEN GEMS</p>
          <h2>본 작품을 골라 주세요</h2>
          <p className="discover-sub">고른 작품을 좋아한 사람들이 본, 덜 알려진 명작을 찾아 드려요. {RECOMMENDED_PICKS}개 이상 고르면 더 정확해요.</p>
        </div>
      </div>

      <ul className="seed-grid">
        {SEEDS.map((s) => {
          const on = picks.includes(s.id);
          return (
            <li key={s.id}>
              <button type="button" className={`seed${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => onToggle(s.id)}>
                <img src={posterUrl(s.poster, 'w185')} alt="" width="185" height="278" loading="lazy" />
                <span className="seed-title">{s.title}</span>
                {on && <i className="seed-check" aria-hidden>✓</i>}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="discover-submit">
        <button type="button" className="btn-primary corners" disabled={picks.length === 0} onClick={onSubmit}>
          {picks.length ? `${picks.length}개 작품으로 숨은 명작 찾기 →` : '본 작품을 골라 주세요'}
        </button>
      </div>
    </section>
  );
}

/** 완결 여부 · 화수는 상세에만 있어 카드마다 늦게 채운다(상세 모달과 같은 쿼리라 다시 요청하지 않음) */
function Burden({ id }) {
  const { data } = useAnimeDetail({ type: 'tv', id });
  if (!data) return <span className="gem-burden is-loading" aria-hidden>…</span>;
  const parts = [data.status, data.episodes && `${data.episodes}화`].filter(Boolean);
  return parts.length ? <span className="gem-burden">{parts.join(' · ')}</span> : null;
}

function GemCard({ gem, rank, onSelect, onSeen }) {
  const { item, reasons } = gem;
  const src = posterUrl(item.poster, 'w185');
  return (
    <li className="gem-card">
      <a
        className="gem-main"
        href={detailPath('tv', item.id)}
        onClick={(e) => { if (isPlainClick(e)) { e.preventDefault(); onSelect(item); } }}
      >
        <span className="gem-rank">{rank}</span>
        {src
          ? <img className="gem-poster" src={src} alt="" width="72" height="108" loading="lazy" />
          : <div className="gem-poster poster-empty" aria-hidden />}
        <div className="gem-text">
          <strong>{item.title}</strong>
          <span className="gem-meta">{item.year} · ★{item.rating.toFixed(1)} <Burden id={item.id} /></span>
          <span className="gem-reason">{reasons.slice(0, 2).join(' · ')}{reasons.length > 2 && ` 외 ${reasons.length - 2}편`} 팬이라면</span>
        </div>
      </a>
      <button type="button" className="btn-outline gem-seen" onClick={() => onSeen(item.id)}>이미 봤어요</button>
    </li>
  );
}

function GemResults({ seedIds, onSelect, onRepick }) {
  const seen = useSeen();
  const { gems, isPending, isError } = useHiddenGems(seedIds, seen.ids);

  return (
    <section className="discover">
      <div className="list-head discover-head">
        <div>
          <p className="eyebrow">DISCOVER · HIDDEN GEMS</p>
          <h2>이거 봤으면, 다음은 이거</h2>
          <ul className="seed-chips">
            {seedIds.map((id) => <li key={id}>{SEED_BY_ID.get(id).title}</li>)}
          </ul>
        </div>
        <button type="button" className="btn-outline" onClick={onRepick}>다시 고르기</button>
      </div>

      {isError ? (
        <p className="message">추천을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
      ) : isPending ? (
        <ul className="gem-list skeleton" aria-hidden>
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="gem-card"><div className="gem-main"><i className="gem-poster" /><i style={{ width: '50%' }} /></div></li>
          ))}
        </ul>
      ) : gems.length === 0 ? (
        <p className="message">조건에 맞는 숨은 명작을 찾지 못했어요. 다른 작품도 골라 보세요.</p>
      ) : (
        <ol className="gem-list">
          {gems.map((gem, i) => (
            <GemCard key={gem.item.id} gem={gem} rank={i + 1} onSelect={onSelect} onSeen={seen.add} />
          ))}
        </ol>
      )}
    </section>
  );
}

/** /discover — 본 유명작을 고르면(?seen=…) TMDB 추천을 합산해 덜 알려진 명작을 보여 준다 */
export default function Discover({ seen, navigate, onSelect }) {
  const [savedPicks, setSavedPicks] = useDiscoverPicks();
  const [picks, setPicks] = useState(() => (seen.length ? seen : savedPicks));

  // 결과를 본 조합을 "마지막으로 고른 작품"으로 기억 — 공유 링크로 들어온 경우도 포함
  const seenKey = seen.join('.');
  useEffect(() => {
    if (seen.length) setSavedPicks(seen);
  }, [seenKey]);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = '숨은 명작 찾기 - ANIWIKI';
    return () => { document.title = prevTitle; };
  }, []);

  const toggle = (id) => setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = () => {
    navigate(discoverPath(picks));
    window.scrollTo({ top: 0 });
  };

  if (seen.length) {
    return (
      <GemResults
        seedIds={seen}
        onSelect={onSelect}
        onRepick={() => { setPicks(seen); navigate('/discover'); }}
      />
    );
  }
  return <SeedPicker picks={picks} onToggle={toggle} onSubmit={submit} />;
}
