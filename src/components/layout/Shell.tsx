"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Top10Modal from "@/components/top10/Top10Modal";
import { useTop10Store } from "@/stores/top10";
import { useUiStore } from "@/stores/ui";
import Header from "./Header";
import SearchBar from "./SearchBar";
import s from "./Shell.module.css";

export default function Shell({ children }: { children: ReactNode }) {
  const top10Open = useUiStore((s) => s.top10Open);
  const pathname = usePathname();
  const Logo = pathname.startsWith("/anime/") ? "p" : "h1";

  useEffect(() => {
    useTop10Store.persist.rehydrate();
  }, []);

  return (
    <>
      <Header />
      <main className="container">
        <section className={s.hero}>
          <div>
            <p className="eyebrow">TMDB · TOP RATED · ANIMATION</p>
            <Logo className={s.logo}>
              <Link
                href="/"
                replace={pathname === "/"}
                onClick={() => window.scrollTo({ top: 0 })}
              >
                ANIWIKI
              </Link>
            </Logo>
          </div>
          <SearchBar />
        </section>

        <hr className={s.divider} />

        {children}
      </main>

      {top10Open && <Top10Modal />}
    </>
  );
}
