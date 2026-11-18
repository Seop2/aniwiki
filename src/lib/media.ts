import type { MediaType } from '@/types';

export const MEDIA = {
  tv: { label: 'TV 시리즈', title: 'name', original: 'original_name', date: 'first_air_date', dateParam: 'first_air_date' },
  movie: { label: '극장판', title: 'title', original: 'original_title', date: 'release_date', dateParam: 'primary_release_date' },
} as const;

export interface TmdbListItem {
  id: number;
  name?: string;
  title?: string;
  original_name?: string;
  original_title?: string;
  first_air_date?: string;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  poster_path: string | null;
  original_language: string;
  genre_ids?: number[];
}

export function normalize(raw: TmdbListItem, type: MediaType) {
  const m = MEDIA[type];
  const date = raw[m.date] || null;
  return {
    id: raw.id,
    title: raw[m.title] ?? '',
    originalTitle: raw[m.original] ?? '',
    date,
    year: date ? date.slice(0, 4) : '—',
    rating: raw.vote_average ?? 0,
    votes: raw.vote_count ?? 0,
    popularity: raw.popularity ?? 0,
    poster: raw.poster_path,
    originalLanguage: raw.original_language,
    genreIds: raw.genre_ids ?? [],
  };
}

export const overviewSummary = (overview: string | null | undefined) =>
  (overview && overview.length > 150 ? `${overview.slice(0, 150)}…` : overview) || undefined;
