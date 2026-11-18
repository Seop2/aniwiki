'use client';

import { createContext, useContext, useState } from 'react';
import { useMyTop10 } from '../../hooks/useMyTop10';

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [preview, setPreview] = useState(null);
  const [top10Open, setTop10Open] = useState(false);
  const top10 = useMyTop10();

  const value = {
    preview,
    top10,
    top10Open,
    openDetail: (type, item) => setPreview({ type, item }),
    openTop10: () => setTop10Open(true),
    closeTop10: () => setTop10Open(false),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export const useAppState = () => useContext(AppStateContext);
