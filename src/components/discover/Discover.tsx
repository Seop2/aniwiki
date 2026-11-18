'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { AnimeSummary } from '@/types';
import { posterUrl } from '../../lib/catalog';
import { SEEDS, SEED_BY_ID } from '../../data/seeds';
import { discoverPath, type rankHiddenGems } from '../../lib/discover';
import { detailPath } from '../../lib/paths';
import { useAnimeDetail } from '../../hooks/useAnimeDetail';
import { useHiddenGems } from '../../hooks/useHiddenGems';
import { useDiscoverPicks, useSeen } from '../../hooks/useSeen';
import { useAppState } from '../layout/AppState';
import Poster from '../common/Poster';
import './Discover.css';

const RECOMMENDED_PICKS = 3;

function SeedPicker({ picks, onToggle, onSubmit }: { picks: number[]; onToggle: (id: number) => void; onSubmit: () => void }) {
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
                <img src={posterUrl(s.poster, 'w185')!} alt="" width="185" height="278" loading="lazy" />
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

function Burden({ id }: { id: number }) {
  const { data } = useAnimeDetail({ type: 'tv', id });
  if (!data) return <span className="gem-burden is-loading" aria-hidden>…</span>;
  const parts = [data.status, data.episodes && `${data.episodes}화`].filter(Boolean);
  return parts.length ? <span className="gem-burden">{parts.join(' · ')}</span> : null;
}

function GemCard({ gem, rank, onSelect, onSeen }: {
  gem: ReturnType<typeof rankHiddenGems>[number];
  rank: number;
  onSelect: (item: AnimeSummary) => void;
  onSeen: (id: number) => void;
}) {
  const { item, reasons } = gem;
  return (
    <li className="gem-card">
      <Link className="gem-main" href={detailPath('tv', item.id)} onClick={() => onSelect(item)}>
        <span className="gem-rank">{rank}</span>
        <Poster className="gem-poster" path={item.poster} size="w185" width="72" height="108" loading="lazy" />
        <div className="gem-text">
          <strong>{item.title}</strong>
          <span className="gem-meta">{item.year} · ★{item.rating.toFixed(1)} <Burden id={item.id} /></span>
          <span className="gem-reason">{reasons.slice(0, 2).join(' · ')}{reasons.length > 2 && ` 외 ${reasons.length - 2}편`} 팬이라면</span>
        </div>
      </Link>
      <button type="button" className="btn-outline gem-seen" onClick={() => onSeen(item.id)}>이미 봤어요</button>
    </li>
  );
}

function GemResults({ seedIds, onSelect, onRepick }: { seedIds: number[]; onSelect: (item: AnimeSummary) => void; onRepick: () => void }) {
  const seen = useSeen();
  const { gems, isPending, isError } = useHiddenGems(seedIds, seen.ids);

  return (
    <section className="discover">
      <div className="list-head discover-head">
        <div>
          <p className="eyebrow">DISCOVER · HIDDEN GEMS</p>
          <h2>이거 봤으면, 다음은 이거</h2>
          <ul className="seed-chips">
            {seedIds.map((id) => <li key={id}>{SEED_BY_ID.get(id)!.title}</li>)}
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

export default function Discover({ seen }: { seen: number[] }) {
  const router = useRouter();
  const { openDetail } = useAppState();
  const onSelect = (item: AnimeSummary) => openDetail('tv', item);
  const [savedPicks, setSavedPicks] = useDiscoverPicks();
  const [touched, setPicks] = useState<number[] | null>(null);
  const picks = touched ?? (seen.length ? seen : savedPicks);

  const seenKey = seen.join('.');
  useEffect(() => {
    if (seen.length) setSavedPicks(seen);
  }, [seenKey]);

  const toggle = (id: number) => setPicks(picks.includes(id) ? picks.filter((x) => x !== id) : [...picks, id]);

  const submit = () => router.push(discoverPath(picks));

  if (seen.length) {
    return (
      <GemResults
        seedIds={seen}
        onSelect={onSelect}
        onRepick={() => { setPicks(seen); router.push('/discover'); }}
      />
    );
  }
  return <SeedPicker picks={picks} onToggle={toggle} onSubmit={submit} />;
}
