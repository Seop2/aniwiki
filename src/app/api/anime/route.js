import { PROVIDERS, SORTS } from '@/lib/catalog';
import { fetchAnimePage, REVALIDATE } from '@/server/tmdb';
import { badRequest, cachedJson, errorJson, isType, parsePage } from '@/server/respond';

const MAX_QUERY = 100;

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const type = params.get('type');
  const sort = params.get('sort') ?? 'rating';
  const query = (params.get('query') ?? '').trim();
  const page = parsePage(params.get('page'));
  const providers = (params.get('providers') ?? '').split(',').filter((k) => PROVIDERS.some((p) => p.key === k));

  if (!isType(type) || !Object.hasOwn(SORTS, sort) || !page || query.length > MAX_QUERY) return badRequest();

  try {
    return cachedJson(await fetchAnimePage({ type, sort, query, page, providers }), REVALIDATE.list);
  } catch (e) {
    return errorJson(e);
  }
}
