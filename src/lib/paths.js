import { ORIGINS, SORTS } from './catalog';
import { MEDIA } from './media';

export const detailPath = (type, id) => `/anime/${type}/${id}`;

export function parseDetailParams(type, id) {
  return Object.hasOwn(MEDIA, type) && /^\d{1,9}$/.test(id) ? { type, id: Number(id) } : null;
}

export function parseHomeParams(params) {
  const type = params.get('type');
  const sort = params.get('sort');
  const origin = params.get('origin');
  return {
    type: Object.hasOwn(MEDIA, type) ? type : 'tv',
    sort: Object.hasOwn(SORTS, sort) ? sort : 'rating',
    q: (params.get('q') ?? '').trim().slice(0, 100),
    original: params.get('original') === '1',
    origin: Object.hasOwn(ORIGINS, origin) ? origin : '',
  };
}

export function homePath({ type, sort, q, original, origin }) {
  const params = new URLSearchParams();
  if (type !== 'tv') params.set('type', type);
  if (sort !== 'rating') params.set('sort', sort);
  if (q) params.set('q', q);
  if (origin) params.set('origin', origin);
  if (original) params.set('original', '1');
  const search = params.toString();
  return search ? `/?${search}` : '/';
}

export const toSearchParams = (params) =>
  new URLSearchParams(Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
