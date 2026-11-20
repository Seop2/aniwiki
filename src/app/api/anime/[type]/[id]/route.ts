import type { NextRequest } from "next/server";
import { parseDetailParams } from "@/lib/paths";
import { badRequest, cachedJson, errorJson } from "@/server/respond";
import { fetchAnimeDetail, REVALIDATE } from "@/server/tmdb";

export async function GET(
  _request: NextRequest,
  { params }: RouteContext<"/api/anime/[type]/[id]">,
) {
  const { type, id } = await params;
  const detail = parseDetailParams(type, id);
  if (!detail) return badRequest();

  try {
    return cachedJson(await fetchAnimeDetail(detail), REVALIDATE.detail);
  } catch (e) {
    return errorJson(e);
  }
}
