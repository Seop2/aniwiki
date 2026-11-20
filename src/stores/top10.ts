import { create } from "zustand";
import { persist, type PersistStorage } from "zustand/middleware";
import type { AnimeSummary, MediaType, Top10, Top10Item } from "@/types";
import { TOP10_MAX } from "@/lib/share";

const readTop10 = (saved: any): Top10 | undefined =>
  saved && Array.isArray(saved.items)
    ? { name: saved.name ?? "", items: saved.items.slice(0, TOP10_MAX) }
    : undefined;

const storage: PersistStorage<Top10> = {
  getItem: (key) => {
    try {
      const state = readTop10(JSON.parse(localStorage.getItem(key) ?? "null"));
      return state ? { state } : null;
    } catch {
      return null;
    }
  },
  setItem: (key, { state }) => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

const same = (a: Top10Item, type: MediaType, id: number) =>
  a.type === type && a.id === id;

interface Top10Store extends Top10 {
  add: (
    type: MediaType,
    item: Pick<AnimeSummary, "id" | "title" | "year" | "poster">,
  ) => void;
  remove: (type: MediaType, id: number) => void;
  move: (index: number, dir: number) => void;
  setName: (value: string) => void;
}

export const useTop10Store = create<Top10Store>()(
  persist(
    (set) => ({
      name: "",
      items: [],
      add: (type, { id, title, year, poster }) =>
        set((s) =>
          s.items.length >= TOP10_MAX || s.items.some((a) => same(a, type, id))
            ? s
            : { items: [...s.items, { type, id, title, year, poster }] },
        ),
      remove: (type, id) =>
        set((s) => ({ items: s.items.filter((a) => !same(a, type, id)) })),
      move: (index, dir) =>
        set((s) => {
          const to = index + dir;
          if (to < 0 || to >= s.items.length) return s;
          const items = [...s.items];
          [items[index], items[to]] = [items[to], items[index]];
          return { items };
        }),
      setName: (name) => set({ name }),
    }),
    {
      name: "aniwiki-top10",
      storage,
      partialize: ({ name, items }) => ({ name, items }),
      skipHydration: true,
    },
  ),
);

export const useInTop10 = (type: MediaType, id: number) =>
  useTop10Store((s) => s.items.some((a) => same(a, type, id)));
