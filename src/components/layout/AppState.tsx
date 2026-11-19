"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import type { AnimeSummary, MediaType } from "@/types";
import { useMyTop10 } from "../../hooks/useMyTop10";

interface AppState {
  preview: { type: MediaType; item: AnimeSummary } | null;
  top10: ReturnType<typeof useMyTop10>;
  top10Open: boolean;
  openDetail: (type: MediaType, item: AnimeSummary) => void;
  openTop10: () => void;
  closeTop10: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<AppState["preview"]>(null);
  const [top10Open, setTop10Open] = useState(false);
  const top10 = useMyTop10();

  const value: AppState = {
    preview,
    top10,
    top10Open,
    openDetail: (type, item) => setPreview({ type, item }),
    openTop10: () => setTop10Open(true),
    closeTop10: () => setTop10Open(false),
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

/**
 * 전역 상태 컨텍스트
 * @returns 
 */
export function useAppState() {
  const app = useContext(AppStateContext);
  if (!app) throw new Error("AppStateProvider 밖에서 useAppState를 불렀습니다");
  return app;
}
