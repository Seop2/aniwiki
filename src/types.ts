import type { MEDIA, normalize } from './lib/media';
import type { ORIGINS, PROVIDERS, SORTS } from './lib/catalog';
import type { fetchAnimeDetail } from './server/tmdb';

export type MediaType = keyof typeof MEDIA;
export type SortKey = keyof typeof SORTS;
export type OriginKey = keyof typeof ORIGINS;
export type ProviderKey = (typeof PROVIDERS)[number]['key'];

export type AnimeItem = ReturnType<typeof normalize>;
export type AnimeDetail = Awaited<ReturnType<typeof fetchAnimeDetail>>;
export type NetflixOriginal = Omit<AnimeItem, 'genreIds'> & { type: MediaType };

export interface HomeParams {
  type: MediaType;
  sort: SortKey;
  q: string;
  original: boolean;
  origin: OriginKey | '';
}

export interface AnimePage {
  items: AnimeItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface Top10Item {
  type: MediaType;
  id: number;
  title: string;
  year: string;
  poster: string | null;
}

export interface Top10 {
  name: string;
  items: Top10Item[];
}
