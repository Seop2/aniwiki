import { useState } from 'react';
import { MEDIA, SORTS } from './api/tmdb';
import { useAnimeList } from './hooks/useAnimeList';
import { useMyTop10 } from './hooks/useMyTop10';
import { parseShareUrl } from './lib/share';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import RankingTable from './components/RankingTable';
import DetailModal from './components/DetailModal';
import Top10Modal from './components/Top10Modal';
import SharedTop10 from './components/SharedTop10';

export default function App() {
  const [type, setType] = useState('tv');
  const [sort, setSort] = useState('rating');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null); // { type, item }
  const [top10Open, setTop10Open] = useState(false);
  const [shared, setShared] = useState(() => parseShareUrl(location.search)); // 공유 링크로 들어온 경우

  const top10 = useMyTop10();
  const list = useAnimeList({ type, sort, query });

  const leaveShared = () => {
    history.replaceState(null, '', '/');
    setShared(null);
  };

  const heading = query
    ? `“${query}” 검색 결과`
    : `${MEDIA[type].label} · ${SORTS[sort].label}`;

  return (
    <>
      <Header top10Count={top10.items.length} onOpenTop10={() => setTop10Open(true)} />
      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">TMDB · TOP RATED · ANIMATION</p>
            <h1 className="logo">ANIWIKI</h1>
          </div>
          <SearchBar onSearch={(q) => { leaveShared(); setQuery(q); }} />
        </section>

        <hr className="divider" />

        {shared ? (
          <SharedTop10
            shared={shared}
            onSelect={setSelected}
            onCreate={() => { leaveShared(); setTop10Open(true); }}
          />
        ) : (
          <>
            <Filters type={type} onTypeChange={setType} sort={sort} onSortChange={setSort} />

            <div className="list-head">
              <h2>{heading}</h2>
              {!list.isPending && !list.isError && <span className="count">총 {list.total.toLocaleString()}편</span>}
            </div>

            <RankingTable {...list} onSelect={(item) => setSelected({ type, item })} />
          </>
        )}
      </main>

      {selected && <DetailModal {...selected} top10={top10} onClose={() => setSelected(null)} />}
      {top10Open && <Top10Modal top10={top10} onClose={() => setTop10Open(false)} />}
    </>
  );
}
