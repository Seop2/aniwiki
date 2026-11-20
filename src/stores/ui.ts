import { create } from "zustand";
import type { AnimeSummary, MediaType } from "@/types";

interface UiStore {
  preview: { type: MediaType; item: AnimeSummary } | null;
  top10Open: boolean;
  openDetail: (type: MediaType, item: AnimeSummary) => void;
  openTop10: () => void;
  closeTop10: () => void;
}

export const useUiStore = create<UiStore>()((set) => ({
  preview: null,
  top10Open: false,
  openDetail: (type, item) => set({ preview: { type, item } }),
  openTop10: () => set({ top10Open: true }),
  closeTop10: () => set({ top10Open: false }),
}));
