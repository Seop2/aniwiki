import { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { MEDIA, PROVIDERS, SORTS } from './api/tmdb';
import { useAnimeList } from './hooks/useAnimeList';
import { useMyTop10 } from './hooks/useMyTop10';
import { usePersistedIds } from './hooks/useSeen';
import { useCanonical } from './hooks/useDocumentMeta';
import { analyticsPath, analyticsRoute, canonicalPath, detailPath, parseRoute, useRoute } from './lib/router';
import AppLink from './components/AppLink';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import RankingTable from './components/RankingTable';
import DetailModal from './components/DetailModal';
import Top10Modal from './components/Top10Modal';
import SharedTop10 from './components/SharedTop10';
import Discover from './components/Discover';
import './App.css';

export default function App() {
  const { loc, route, navigate } = useRoute();
  const [type, setType] = useState('tv');
  const [sort, setSort] = useState('rating');
  const [query, setQuery] = useState('');
  // 내 구독 OTT라서 저장하고 로고 클릭으로도 초기화하지 않는다
  const [providers, setProviders] = usePersistedIds('aniwiki-providers', (k) => PROVIDERS.some((p) => p.key === k));
  const [original, setOriginal] = useState(false);
  const [preview, setPreview] = useState(null); // 상세를 연 목록 항목 { type, item } — 상세가 오기 전에 먼저 그린다
  const [top10Open, setTop10Open] = useState(false);
  const [homeKey, setHomeKey] = useState(0); // 바꾸면 SearchBar가 다시 마운트돼 입력값이 비워진다
  const closing = useRef(false); // 닫기 연타로 history.back()이 두 번 불려 사이트를 벗어나지 않게

  const top10 = useMyTop10();
  const list = useAnimeList({ type, sort, query, providers, original });

  useEffect(() => { closing.current = false; }, [loc]);

  useCanonical(canonicalPath(route));

  // 상세 모달 뒤에 깔리는 화면: 앱 안에서 열었으면 열기 전 화면, 상세 주소로 바로 들어왔으면 랭킹
  const bg = loc.state?.bg;
  const view = route.name === 'detail' ? (bg ? parseRoute(bg.pathname, bg.search) : { name: 'home' }) : route;

  const openDetail = (itemType, item) => {
    setPreview({ type: itemType, item });
    navigate(detailPath(itemType, item.id), { state: { bg: { pathname: loc.pathname, search: loc.search } } });
  };

  const closeDetail = () => {
    if (closing.current) return;
    closing.current = true;
    if (bg) history.back(); // 브라우저 뒤로가기와 같은 결과
    else navigate('/', { replace: true });
  };

  /** 공유 · 숨은 명작 화면에서 검색하거나 「나도 만들기」를 누르면 랭킹으로 */
  const leaveToHome = () => {
    if (view.name !== 'home') navigate('/');
  };

  const openDiscover = () => {
    navigate('/discover');
    window.scrollTo({ top: 0 });
  };

  /** 로고 클릭 → 검색 · 필터 · 공유 화면을 모두 초기 상태로 */
  const goHome = () => {
    navigate('/', { replace: route.name === 'home' });
    setQuery('');
    setType('tv');
    setSort('rating');
    setOriginal(false);
    setHomeKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };

  const watchLabel = original
    ? '넷플릭스 오리지널'
    : PROVIDERS.filter((p) => providers.includes(p.key)).map((p) => p.label).join('·');
  const heading = query
    ? `“${query}” 검색 결과`
    : [MEDIA[type].label, SORTS[sort].label, watchLabel].filter(Boolean).join(' · ');

  const detailItem = route.name === 'detail' && preview?.type === route.type && preview.item.id === route.id
    ? preview.item
    : undefined;

  return (
    <>
      <Header top10Count={top10.items.length} onOpenTop10={() => setTop10Open(true)} onOpenDiscover={openDiscover} />
      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">TMDB · TOP RATED · ANIMATION</p>
            <h1 className="logo"><AppLink href="/" onNavigate={goHome}>ANIWIKI</AppLink></h1>
          </div>
          <SearchBar key={homeKey} onSearch={(q) => { leaveToHome(); setQuery(q); }} />
        </section>

        <hr className="divider" />

        {view.name === 'shared' ? (
          <SharedTop10
            shared={view.shared}
            onSelect={({ type: t, item }) => openDetail(t, item)}
            onCreate={() => { leaveToHome(); setTop10Open(true); }}
          />
        ) : view.name === 'discover' ? (
          <Discover
            seen={view.seen}
            navigate={navigate}
            onSelect={(item) => openDetail('tv', item)}
          />
        ) : (
          <>
            <AppLink className="discover-cta corners" href="/discover" onNavigate={openDiscover}>
              <span className="eyebrow">숨은 명작 찾기</span>
              <strong>원피스·진격은 봤다면, 다음은 이거 →</strong>
            </AppLink>

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
        )}
      </main>

      {route.name === 'detail' && (
        <DetailModal
          key={`${route.type}-${route.id}`}
          type={route.type}
          id={route.id}
          item={detailItem}
          top10={top10}
          onClose={closeDetail}
        />
      )}
      {top10Open && <Top10Modal top10={top10} onClose={() => setTop10Open(false)} />}
      <Analytics route={analyticsRoute(route)} path={analyticsPath(route, loc.pathname)} />
    </>
  );
}
