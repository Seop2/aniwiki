import type { NextRequest } from "next/server";
import type { OriginKey, ProviderKey } from "@/types";
import { MEDIA, ORIGINS, PROVIDERS, SORTS } from "@/lib/catalog";
import { isKey } from "@/lib/paths";
import { fetchAnimePage, REVALIDATE } from "@/server/tmdb";
import { badRequest, cachedJson, errorJson, parsePage } from "@/server/respond";

const MAX_QUERY = 100;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type");
  const sort = params.get("sort") ?? "rating";
  const query = (params.get("query") ?? "").trim();
  const origin = params.get("origin") ?? "";
  const page = parsePage(params.get("page"));
  const providers = (params.get("providers") ?? "")
    .split(",")
    .filter((k): k is ProviderKey => PROVIDERS.some((p) => p.key === k));

  if (
    !isKey(MEDIA, type) ||
    !isKey(SORTS, sort) ||
    (origin && !isKey(ORIGINS, origin)) ||
    !page ||
    query.length > MAX_QUERY
  )
    return badRequest();

  try {
    return cachedJson(
      await fetchAnimePage({
        type,
        sort,
        query,
        page,
        providers,
        origin: origin as OriginKey | "",
      }),
      REVALIDATE.list,
    );
  } catch (e) {
    return errorJson(e);
  }
}
