import 'server-only';
import { MEDIA } from '@/lib/catalog';
import { TmdbError } from './tmdb';

export const isType = (type) => Object.hasOwn(MEDIA, type);

/** 1~500(TMDB가 허용하는 페이지) 밖이면 null */
export function parsePage(value) {
  const page = Number(value ?? 1);
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : null;
}

export const badRequest = () => Response.json({ error: 'BAD_REQUEST' }, { status: 400 });

/** CDN에도 서버 캐시와 같은 시간만큼 캐시한다 */
export const cachedJson = (data, seconds) =>
  Response.json(data, { headers: { 'Cache-Control': `public, s-maxage=${seconds}, stale-while-revalidate=86400` } });

/** 클라이언트는 error 값을 그대로 Error 메시지로 쓴다(MISSING_TOKEN은 안내 문구가 따로 있다) */
export function errorJson(e) {
  if (e.message === 'MISSING_TOKEN') return Response.json({ error: 'MISSING_TOKEN' }, { status: 500 });
  if (e instanceof TmdbError) {
    const status = e.status === 404 ? 404 : 502;
    return Response.json({ error: `TMDB ${e.status}` }, { status });
  }
  throw e;
}
