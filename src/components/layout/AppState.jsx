'use client';

import { createContext, useContext, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PROVIDERS } from '../../lib/catalog';
import { useMyTop10 } from '../../hooks/useMyTop10';
import { usePersistedIds } from '../../hooks/useSeen';

// 페이지를 오가도 유지되는 화면 상태(랭킹 필터 · 검색어 · 내 TOP 10). layout에 있어 페이지가 바뀌어도 사라지지 않는다
const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [type, setType] = useState('tv');
  const [sort, setSort] = useState('rating');
  const [query, setQuery] = useState('');
  // 내 구독 OTT라서 저장하고 로고 클릭으로도 초기화하지 않는다
  const [providers, setProviders] = usePersistedIds('aniwiki-providers', (k) => PROVIDERS.some((p) => p.key === k));
  const [original, setOriginal] = useState(false);
  const [homeKey, setHomeKey] = useState(0); // 바꾸면 SearchBar가 다시 마운트돼 입력값이 비워진다
  const [preview, setPreview] = useState(null); // 상세를 연 목록 항목 { type, item } — 상세가 오기 전에 먼저 그린다
  const [top10Open, setTop10Open] = useState(false);
  const top10 = useMyTop10();

  const value = {
    type, setType, sort, setSort, query, providers, setProviders, original, setOriginal,
    homeKey, preview, top10, top10Open,

    /** 공유 · 숨은 명작 화면에서 검색하면 랭킹으로 */
    search: (q) => {
      if (pathname !== '/') router.push('/');
      setQuery(q);
    },
    /** 로고 클릭 → 검색 · 필터를 초기 상태로(이동은 링크가 한다) */
    resetHome: () => {
      setQuery('');
      setType('tv');
      setSort('rating');
      setOriginal(false);
      setHomeKey((k) => k + 1);
    },
    /** 목록 항목을 눌러 상세로 갈 때 — 상세 모달이 받아 쓴다 */
    openDetail: (itemType, item) => setPreview({ type: itemType, item }),
    openTop10: () => setTop10Open(true),
    closeTop10: () => setTop10Open(false),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = () => useContext(AppStateContext);
