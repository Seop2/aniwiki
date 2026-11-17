import { fetchRecommendations, REVALIDATE } from '@/server/tmdb';
import { parseDetailParams } from '@/lib/paths';
import { badRequest, cachedJson, errorJson, parsePage } from '@/server/respond';

/** 작품별 TMDB 추천 한 페이지(20편) — 숨은 명작 계산용 */
export async function GET(request, { params }) {
  const { type, id } = await params;
  const detail = parseDetailParams(type, id);
  const page = parsePage(request.nextUrl.searchParams.get('page'));
  if (!detail || !page) return badRequest();

  try {
    return cachedJson(await fetchRecommendations({ ...detail, page }), REVALIDATE.recommendations);
  } catch (e) {
    return errorJson(e);
  }
}
