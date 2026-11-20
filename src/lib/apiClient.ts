import type {
  AnimeDetail,
  AnimeItem,
  AnimePage,
  DetailParams,
  ListParams,
  NetflixOriginal,
} from "@/types";

async function getJson<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
): Promise<T> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const qs = search.toString();
  const res = await fetch(qs ? `${path}?${qs}` : path);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const fetchAnimePage = ({
  type,
  sort,
  query,
  page,
  providers = [],
  origin = "",
}: ListParams) =>
  getJson<AnimePage>(
    "/api/anime",
    query
      ? { type, query, page }
      : { type, sort, page, providers: providers.join(","), origin },
  );

export const fetchRecommendations = ({
  type,
  id,
  page = 1,
}: DetailParams & { page?: number }) =>
  getJson<AnimeItem[]>(`/api/anime/${type}/${id}/recommendations`, { page });

export const fetchAnimeDetail = ({ type, id }: DetailParams) =>
  getJson<AnimeDetail>(`/api/anime/${type}/${id}`);

export const fetchNetflixOriginals = () =>
  getJson<NetflixOriginal[]>("/api/netflix-originals");
