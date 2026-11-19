"use client";

import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { homePath, parseHomeParams } from "../../lib/paths";
import s from "./SearchBar.module.css";

function SearchForm({
  initial = "",
  onSearch,
}: {
  initial?: string;
  onSearch?: (q: string) => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <form
      className={s.search}
      role="search"
      action="/"
      onSubmit={(e) => {
        if (!onSearch) return;
        e.preventDefault();
        onSearch(value.trim());
      }}
    >
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="작품 제목 검색 (예: 프리렌, 진격의 거인)"
        aria-label="작품 제목 검색"
      />
      <button type="submit" className="btn-primary corners" aria-label="검색">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className={s.label}>검색</span>
      </button>
    </form>
  );
}

function UrlSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = parseHomeParams(
    pathname === "/" ? searchParams : new URLSearchParams(),
  );

  return (
    <SearchForm
      key={current.q}
      initial={current.q}
      onSearch={(q) => router.push(homePath({ ...current, q }))}
    />
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={<SearchForm />}>
      <UrlSearchForm />
    </Suspense>
  );
}
