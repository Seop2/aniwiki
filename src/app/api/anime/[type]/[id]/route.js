import { fetchAnimeDetail, REVALIDATE } from '@/server/tmdb';
import { badRequest, cachedJson, errorJson, isId, isType } from '@/server/respond';

/** 작품 상세 + 한국 시청처 */
export async function GET(_request, { params }) {
  const { type, id } = await params;
  if (!isType(type) || !isId(id)) return badRequest();

  try {
    return cachedJson(await fetchAnimeDetail({ type, id: Number(id) }), REVALIDATE.detail);
  } catch (e) {
    return errorJson(e);
  }
}
