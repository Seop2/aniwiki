import { fetchRecommendations, REVALIDATE } from '@/server/tmdb';
import { badRequest, cachedJson, errorJson, isId, isType, parsePage } from '@/server/respond';

/** 작품별 TMDB 추천 한 페이지(20편) — 숨은 명작 계산용 */
export async function GET(request, { params }) {
  const { type, id } = await params;
  const page = parsePage(request.nextUrl.searchParams.get('page'));
  if (!isType(type) || !isId(id) || !page) return badRequest();

  try {
    return cachedJson(await fetchRecommendations({ type, id: Number(id), page }), REVALIDATE.recommendations);
  } catch (e) {
    return errorJson(e);
  }
}
