import 'server-only';
import { MEDIA, normalize } from '@/lib/media';
import { isNetflixOriginal, NETFLIX_NETWORK, NETFLIX_PROVIDERS } from '@/lib/netflix';
import { mapLimit, tmdbGet } from './tmdb';

const MAX_PAGES = 30;
const DAILY = { revalidate: 86400 };

const candidateParams = (type) => ({
  with_genres: 16,
  watch_region: 'KR',
  with_watch_providers: NETFLIX_PROVIDERS.join('|'),
  with_watch_monetization_types: 'flatrate|ads',
  [`${MEDIA[type].dateParam}.lte`]: new Date().toISOString().slice(0, 10),
  ...(type === 'tv' && { with_networks: NETFLIX_NETWORK }),
});

async function candidates(type) {
  const params = candidateParams(type);
  const first = await tmdbGet(`/discover/${type}`, { ...params, page: 1 }, DAILY);
  const rest = Array.from({ length: Math.min(first.total_pages, MAX_PAGES) - 1 }, (_, i) => i + 2);
  const pages = await mapLimit(rest, 5, (page) => tmdbGet(`/discover/${type}`, { ...params, page }, DAILY));
  return [first, ...pages].flatMap((p) => p.results);
}

async function originals(type) {
  const list = await candidates(type);
  const append = type === 'movie' ? { append_to_response: 'release_dates' } : {};
  const details = await mapLimit(list, 10, (r) => tmdbGet(`/${type}/${r.id}`, append, DAILY));
  return list
    .filter((_, i) => isNetflixOriginal(details[i]))
    .map((r) => {
      const { genreIds, originalLanguage, ...item } = normalize(r, type);
      return { type, ...item };
    });
}

export async function buildNetflixOriginals() {
  return [...(await originals('tv')), ...(await originals('movie'))];
}
