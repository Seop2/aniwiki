'use client';

import Link from 'next/link';
import { MEDIA, PROVIDERS, SORTS } from '../../lib/catalog';
import { useAnimeList } from '../../hooks/useAnimeList';
import { useAppState } from '../layout/AppState';
import Filters from './Filters';
import RankingTable from './RankingTable';

export default function Home() {
  const {
    type, setType, sort, setSort, query, providers, setProviders, original, setOriginal, openDetail,
  } = useAppState();
  const list = useAnimeList({ type, sort, query, providers, original });

  const watchLabel = original
    ? '넷플릭스 오리지널'
    : PROVIDERS.filter((p) => providers.includes(p.key)).map((p) => p.label).join('·');
  const heading = query
    ? `“${query}” 검색 결과`
    : [MEDIA[type].label, SORTS[sort].label, watchLabel].filter(Boolean).join(' · ');

  return (
    <>
      <Link className="discover-cta corners" href="/discover">
        <span className="eyebrow">숨은 명작 찾기</span>
        <strong>원피스·진격은 봤다면, 다음은 이거 →</strong>
      </Link>

      <Filters
        type={type}
        onTypeChange={setType}
        sort={sort}
        onSortChange={setSort}
        providers={providers}
        onProvidersChange={setProviders}
        original={original}
        onOriginalChange={setOriginal}
        searching={Boolean(query)}
      />

      <div className="list-head">
        <h2>{heading}</h2>
        {!list.isPending && !list.isError && <span className="count">총 {list.total.toLocaleString()}편</span>}
      </div>

      <RankingTable
        {...list}
        type={type}
        emptyText={query ? '검색 결과가 없습니다.' : '이 조건에 맞는 작품이 없어요. 볼 수 있는 곳을 더 골라 보세요.'}
        onSelect={(item) => openDetail(type, item)}
      />
    </>
  );
}
