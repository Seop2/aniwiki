import { MEDIA } from './media';

export const detailPath = (type, id) => `/anime/${type}/${id}`;

export function parseDetailParams(type, id) {
  return Object.hasOwn(MEDIA, type) && /^\d{1,9}$/.test(id) ? { type, id: Number(id) } : null;
}

export const toSearchParams = (params) =>
  new URLSearchParams(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));

export const isPlainClick = (e) => e.button === 0 && !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
