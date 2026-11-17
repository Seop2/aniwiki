'use client';

import { createContext, useContext, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PROVIDERS } from '../../lib/catalog';
import { useMyTop10 } from '../../hooks/useMyTop10';
import { usePersistedIds } from '../../hooks/useSeen';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [type, setType] = useState('tv');
  const [sort, setSort] = useState('rating');
  const [query, setQuery] = useState('');
  const [providers, setProviders] = usePersistedIds('aniwiki-providers', (k) => PROVIDERS.some((p) => p.key === k));
  const [original, setOriginal] = useState(false);
  const [homeKey, setHomeKey] = useState(0);
  const [preview, setPreview] = useState(null);
  const [top10Open, setTop10Open] = useState(false);
  const top10 = useMyTop10();

  const value = {
    type, setType, sort, setSort, query, providers, setProviders, original, setOriginal,
    homeKey, preview, top10, top10Open,

    search: (q) => {
      if (pathname !== '/') router.push('/');
      setQuery(q);
    },
    resetHome: () => {
      setQuery('');
      setType('tv');
      setSort('rating');
      setOriginal(false);
      setHomeKey((k) => k + 1);
      window.scrollTo({ top: 0 }); // 이미 /에 있으면 같은 주소 이동이라 Next가 스크롤하지 않는다
    },
    openDetail: (itemType, item) => setPreview({ type: itemType, item }),
    openTop10: () => setTop10Open(true),
    closeTop10: () => setTop10Open(false),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = () => useContext(AppStateContext);
