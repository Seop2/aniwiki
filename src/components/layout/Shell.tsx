'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Top10Modal from '../top10/Top10Modal';
import { useAppState } from './AppState';
import Header from './Header';
import SearchBar from './SearchBar';
import s from './Shell.module.css';

export default function Shell({ children }: { children: ReactNode }) {
  const app = useAppState();
  const router = useRouter();
  const pathname = usePathname();

  const openDiscover = () => {
    router.push('/discover');
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <Header top10Count={app.top10.items.length} onOpenTop10={app.openTop10} onOpenDiscover={openDiscover} />
      <main className="container">
        <section className={s.hero}>
          <div>
            <p className="eyebrow">TMDB · TOP RATED · ANIMATION</p>
            <h1 className={s.logo}>
              <Link href="/" replace={pathname === '/'} onClick={() => window.scrollTo({ top: 0 })}>ANIWIKI</Link>
            </h1>
          </div>
          <SearchBar />
        </section>

        <hr className={s.divider} />

        {children}
      </main>

      {app.top10Open && <Top10Modal top10={app.top10} onClose={app.closeTop10} />}
    </>
  );
}
