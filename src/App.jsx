import { useState } from 'react';
import { MEDIA, SORTS } from './api/tmdb';
import { useAnimeList } from './hooks/useAnimeList';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import RankingTable from './components/RankingTable';
import DetailModal from './components/DetailModal';

export default function App() {
  const [type, setType] = useState('tv');
  const [sort, setSort] = useState('rating');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null); // { type, item }

  const list = useAnimeList({ type, sort, query });

  const heading = query
    ? `“${query}” 검색 결과`
    : `${MEDIA[type].label} · ${SORTS[sort].label}`;

  return (
    <>
      <Header />
      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">TMDB · TOP RATED · ANIMATION</p>
            <h1 className="logo">ANIWIKI</h1>
          </div>
          <SearchBar onSearch={setQuery} />
        </section>

        <hr className="divider" />

        <Filters type={type} onTypeChange={setType} sort={sort} onSortChange={setSort} />

        <div className="list-head">
          <h2>{heading}</h2>
          {!list.isPending && !list.isError && <span className="count">총 {list.total.toLocaleString()}편</span>}
        </div>

        <RankingTable {...list} onSelect={(item) => setSelected({ type, item })} />
      </main>

      {selected && <DetailModal {...selected} onClose={() => setSelected(null)} />}
    </>
  );
}
