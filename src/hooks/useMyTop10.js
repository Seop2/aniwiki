import { useEffect, useState } from 'react';

const KEY = 'aniwiki-top10';
export const TOP10_MAX = 10;

function initialTop10() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.items)) {
      return { name: saved.name ?? '', items: saved.items.slice(0, TOP10_MAX) };
    }
  } catch {}
  return { name: '', items: [] };
}

const same = (a, type, id) => a.type === type && a.id === id;

/** 내 TOP 10 목록 — localStorage에 저장. 헤더·모달이 같은 상태를 쓰도록 App에서 한 번만 호출한다 */
export function useMyTop10() {
  const [state, setState] = useState(initialTop10);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }, [state]);

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

  /** dir: -1(위로) / 1(아래로) */
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
