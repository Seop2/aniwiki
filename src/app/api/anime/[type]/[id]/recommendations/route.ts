import type { NextRequest } from "next/server";
import { parseDetailParams } from "@/lib/paths";
import { badRequest, cachedJson, errorJson, parsePage } from "@/server/respond";
import { fetchRecommendations, REVALIDATE } from "@/server/tmdb";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/api/anime/[type]/[id]/recommendations">,
) {
  const { type, id } = await params;
  const detail = parseDetailParams(type, id);
  const page = parsePage(request.nextUrl.searchParams.get("page"));
  if (!detail || !page) return badRequest();

  try {
    return cachedJson(
      await fetchRecommendations({ ...detail, page }),
      REVALIDATE.recommendations,
    );
  } catch (e) {
    return errorJson(e);
  }
}
