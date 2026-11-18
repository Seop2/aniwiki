import { MEDIA, ORIGINS, PROVIDERS, SORTS } from '@/lib/catalog';
import { fetchAnimePage, REVALIDATE } from '@/server/tmdb';
import { badRequest, cachedJson, errorJson, parsePage } from '@/server/respond';

const MAX_QUERY = 100;

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const type = params.get('type');
  const sort = params.get('sort') ?? 'rating';
  const query = (params.get('query') ?? '').trim();
  const origin = params.get('origin') ?? '';
  const page = parsePage(params.get('page'));
  const providers = (params.get('providers') ?? '').split(',').filter((k) => PROVIDERS.some((p) => p.key === k));

  if (!Object.hasOwn(MEDIA, type) || !Object.hasOwn(SORTS, sort) || (origin && !Object.hasOwn(ORIGINS, origin)) || !page || query.length > MAX_QUERY) return badRequest();

  try {
    return cachedJson(await fetchAnimePage({ type, sort, query, page, providers, origin }), REVALIDATE.list);
  } catch (e) {
    return errorJson(e);
  }
}
