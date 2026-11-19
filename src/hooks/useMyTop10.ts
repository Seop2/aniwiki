import type { AnimeSummary, MediaType, Top10, Top10Item } from "@/types";
import { TOP10_MAX } from "../lib/share";
import { useStoredValue } from "../lib/storage";

const KEY = "aniwiki-top10";
const EMPTY: Top10 = { name: "", items: [] };

const readTop10 = (saved: any): Top10 | undefined =>
  saved && Array.isArray(saved.items)
    ? { name: saved.name ?? "", items: saved.items.slice(0, TOP10_MAX) }
    : undefined;

const same = (a: Top10Item, type: MediaType, id: number) =>
  a.type === type && a.id === id;

export function useMyTop10() {
  const [state, setState] = useStoredValue(KEY, readTop10, EMPTY);

  const { name, items } = state;
  const has = (type: MediaType, id: number) =>
    items.some((a) => same(a, type, id));

  const add = (
    type: MediaType,
    item: Pick<AnimeSummary, "id" | "title" | "year" | "poster">,
  ) =>
    setState((s) => {
      if (
        s.items.length >= TOP10_MAX ||
        s.items.some((a) => same(a, type, item.id))
      )
        return s;
      const { id, title, year, poster } = item;
      return { ...s, items: [...s.items, { type, id, title, year, poster }] };
    });

  const remove = (type: MediaType, id: number) =>
    setState((s) => ({
      ...s,
      items: s.items.filter((a) => !same(a, type, id)),
    }));

  const move = (index: number, dir: number) =>
    setState((s) => {
      const to = index + dir;
      if (to < 0 || to >= s.items.length) return s;
      const next = [...s.items];
      [next[index], next[to]] = [next[to], next[index]];
      return { ...s, items: next };
    });

  const setName = (value: string) => setState((s) => ({ ...s, name: value }));

  return {
    name,
    items,
    has,
    add,
    remove,
    move,
    setName,
    isFull: items.length >= TOP10_MAX,
  };
}
