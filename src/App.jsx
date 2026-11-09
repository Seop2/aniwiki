import { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { MEDIA, SORTS } from './api/tmdb';
import { useAnimeList } from './hooks/useAnimeList';
import { useMyTop10 } from './hooks/useMyTop10';
import { analyticsRoute, detailPath, isPlainClick, parseRoute, useRoute } from './lib/router';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import RankingTable from './components/RankingTable';
import DetailModal from './components/DetailModal';
import Top10Modal from './components/Top10Modal';
import SharedTop10 from './components/SharedTop10';

export default function App() {
  const { loc, route, navigate } = useRoute();
  const [type, setType] = useState('tv');
  const [sort, setSort] = useState('rating');
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState(null); // 상세를 연 목록 항목 { type, item } — 상세가 오기 전에 먼저 그린다
  const [top10Open, setTop10Open] = useState(false);
  const [homeKey, setHomeKey] = useState(0); // 바꾸면 SearchBar가 다시 마운트돼 입력값이 비워진다
  const closing = useRef(false); // 닫기 연타로 history.back()이 두 번 불려 사이트를 벗어나지 않게

  const top10 = useMyTop10();
  const list = useAnimeList({ type, sort, query });

  useEffect(() => { closing.current = false; }, [loc]);

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

  const leaveShared = () => {
    if (view.name === 'shared') navigate('/');
  };

  /** 로고 클릭 → 검색 · 필터 · 공유 화면을 모두 초기 상태로 */
  const goHome = (e) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    navigate('/', { replace: route.name === 'home' });
    setQuery('');
    setType('tv');
    setSort('rating');
    setHomeKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };

  const heading = query
    ? `“${query}” 검색 결과`
    : `${MEDIA[type].label} · ${SORTS[sort].label}`;

  const detailItem = route.name === 'detail' && preview?.type === route.type && preview.item.id === route.id
    ? preview.item
    : undefined;

  return (
    <>
      <Header top10Count={top10.items.length} onOpenTop10={() => setTop10Open(true)} />
      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">TMDB · TOP RATED · ANIMATION</p>
            <h1 className="logo"><a href="/" onClick={goHome}>ANIWIKI</a></h1>
          </div>
          <SearchBar key={homeKey} onSearch={(q) => { leaveShared(); setQuery(q); }} />
        </section>

        <hr className="divider" />

        {view.name === 'shared' ? (
          <SharedTop10
            shared={view.shared}
            onSelect={({ type: t, item }) => openDetail(t, item)}
            onCreate={() => { leaveShared(); setTop10Open(true); }}
          />
        ) : (
          <>
            <Filters type={type} onTypeChange={setType} sort={sort} onSortChange={setSort} />

            <div className="list-head">
              <h2>{heading}</h2>
              {!list.isPending && !list.isError && <span className="count">총 {list.total.toLocaleString()}편</span>}
            </div>

            <RankingTable {...list} type={type} onSelect={(item) => openDetail(type, item)} />
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
      <Analytics route={analyticsRoute(route)} path={loc.pathname} />
    </>
  );
}
