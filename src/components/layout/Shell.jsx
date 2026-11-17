'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { isPlainClick } from '../../lib/paths';
import Top10Modal from '../top10/Top10Modal';
import { useAppState } from './AppState';
import Header from './Header';
import SearchBar from './SearchBar';
import './Shell.css';

/** 모든 화면에 공통인 헤더 · 로고 · 검색창. children이 페이지 본문 */
export default function Shell({ children }) {
  const app = useAppState();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <Header top10Count={app.top10.items.length} onOpenTop10={app.openTop10} onOpenDiscover={() => router.push('/discover')} />
      <main className="container">
        <section className="hero">
          <div>
            <p className="eyebrow">TMDB · TOP RATED · ANIMATION</p>
            <h1 className="logo">
              <Link href="/" replace={pathname === '/'} onClick={(e) => isPlainClick(e) && app.resetHome()}>ANIWIKI</Link>
            </h1>
          </div>
          <SearchBar key={app.homeKey} onSearch={app.search} />
        </section>

        <hr className="divider" />

        {children}
      </main>

      {app.top10Open && <Top10Modal top10={app.top10} onClose={app.closeTop10} />}
    </>
  );
}
