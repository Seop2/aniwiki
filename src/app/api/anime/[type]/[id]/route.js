import { fetchAnimeDetail, REVALIDATE } from '@/server/tmdb';
import { parseDetailParams } from '@/lib/paths';
import { badRequest, cachedJson, errorJson } from '@/server/respond';

export async function GET(_request, { params }) {
  const { type, id } = await params;
  const detail = parseDetailParams(type, id);
  if (!detail) return badRequest();

  try {
    return cachedJson(await fetchAnimeDetail(detail), REVALIDATE.detail);
  } catch (e) {
    return errorJson(e);
  }
}
