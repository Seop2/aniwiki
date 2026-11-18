import type { HomeParams, MediaType } from '@/types';
import { ORIGINS, SORTS } from './catalog';
import { MEDIA } from './media';

export const isKey = <T extends object>(obj: T, key: unknown): key is keyof T =>
  typeof key === 'string' && Object.hasOwn(obj, key);

export const detailPath = (type: MediaType, id: number) => `/anime/${type}/${id}`;

export function parseDetailParams(type: string, id: string) {
  return isKey(MEDIA, type) && /^\d{1,9}$/.test(id) ? { type, id: Number(id) } : null;
}

export function parseHomeParams(params: URLSearchParams): HomeParams {
  const type = params.get('type');
  const sort = params.get('sort');
  const origin = params.get('origin');
  return {
    type: isKey(MEDIA, type) ? type : 'tv',
    sort: isKey(SORTS, sort) ? sort : 'rating',
    q: (params.get('q') ?? '').trim().slice(0, 100),
    original: params.get('original') === '1',
    origin: isKey(ORIGINS, origin) ? origin : '',
  };
}

export function homePath({ type, sort, q, original, origin }: HomeParams) {
  const params = new URLSearchParams();
  if (type !== 'tv') params.set('type', type);
  if (sort !== 'rating') params.set('sort', sort);
  if (q) params.set('q', q);
  if (origin) params.set('origin', origin);
  if (original) params.set('original', '1');
  const search = params.toString();
  return search ? `/?${search}` : '/';
}

export const toSearchParams = (params: Record<string, string | string[] | undefined>) =>
  new URLSearchParams(Object.entries(params).map(([k, v]) => [k, (Array.isArray(v) ? v[0] : v) ?? '']));
