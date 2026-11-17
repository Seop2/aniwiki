import { TOP10_MAX } from '../lib/share';
import { useStoredValue } from '../lib/storage';

const KEY = 'aniwiki-top10';
const EMPTY = { name: '', items: [] };

const readTop10 = (saved) =>
  saved && Array.isArray(saved.items) ? { name: saved.name ?? '', items: saved.items.slice(0, TOP10_MAX) } : undefined;

const same = (a, type, id) => a.type === type && a.id === id;

export function useMyTop10() {
  const [state, setState] = useStoredValue(KEY, readTop10, EMPTY);

  const { name, items } = state;
  const has = (type, id) => items.some((a) => same(a, type, id));

  const add = (type, item) =>
    setState((s) => {
      if (s.items.length >= TOP10_MAX || s.items.some((a) => same(a, type, item.id))) return s;
      const { id, title, year, poster } = item;
      return { ...s, items: [...s.items, { type, id, title, year, poster }] };
    });

  const remove = (type, id) =>
    setState((s) => ({ ...s, items: s.items.filter((a) => !same(a, type, id)) }));

  const move = (index, dir) =>
    setState((s) => {
      const to = index + dir;
      if (to < 0 || to >= s.items.length) return s;
      const next = [...s.items];
      [next[index], next[to]] = [next[to], next[index]];
      return { ...s, items: next };
    });

  const setName = (value) => setState((s) => ({ ...s, name: value }));

  return { name, items, has, add, remove, move, setName, isFull: items.length >= TOP10_MAX };
}
