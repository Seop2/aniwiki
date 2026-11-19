'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { HomeParams, ProviderKey } from '@/types';
import { MEDIA, ORIGINS, PROVIDERS, SORTS } from '../../lib/catalog';
import { homePath, parseHomeParams } from '../../lib/paths';
import { useAnimeList } from '../../hooks/useAnimeList';
import { usePersistedIds } from '../../hooks/useSeen';
import { useAppState } from '../layout/AppState';
import Filters from './Filters';
import RankingTable from './RankingTable';
import s from './Home.module.css';

export default function Home() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { openDetail } = useAppState();
  const [providers, setProviders] = usePersistedIds<ProviderKey>('aniwiki-providers', (k) => PROVIDERS.some((p) => p.key === k));

  const last = useRef<HomeParams>(null);
  if (pathname === '/' || !last.current) last.current = parseHomeParams(searchParams);
  const { type, sort, q, original, origin } = last.current;

  const setFilter = (next: Partial<HomeParams>) => window.history.replaceState(null, '', homePath({ ...last.current!, ...next }));
  const list = useAnimeList({ type, sort, query: q, providers, original, origin });

  const watchLabel = original
    ? '넷플릭스 오리지널'
    : PROVIDERS.filter((p) => providers.includes(p.key)).map((p) => p.label).join('·');
  const heading = q
    ? `“${q}” 검색 결과`
    : [MEDIA[type].label, origin && ORIGINS[origin].label, SORTS[sort].label, watchLabel].filter(Boolean).join(' · ');

  return (
    <>
      <Link className={`${s.cta} corners`} href="/discover">
        <span className="eyebrow">숨은 명작 찾기</span>
        <strong>원피스·진격은 봤다면, 다음은 이거 →</strong>
      </Link>

      <Filters
        type={type}
        onTypeChange={(value) => setFilter({ type: value })}
        origin={origin}
        onOriginChange={(value) => setFilter({ origin: value })}
        sort={sort}
        onSortChange={(value) => setFilter({ sort: value })}
        providers={providers}
        onProvidersChange={setProviders}
        original={original}
        onOriginalChange={(value) => setFilter({ original: value })}
        searching={Boolean(q)}
      />

      <div className="list-head">
        <h2>{heading}</h2>
        {!list.isPending && !list.isError && <span className="count">총 {list.total.toLocaleString()}편</span>}
      </div>

      <RankingTable
        {...list}
        type={type}
        emptyText={q ? '검색 결과가 없습니다.' : '이 조건에 맞는 작품이 없어요. 볼 수 있는 곳을 더 골라 보세요.'}
        onSelect={(item) => openDetail(type, item)}
      />
    </>
  );
}
