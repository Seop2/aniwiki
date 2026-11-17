// TMDB 응답 → 앱 데이터 매핑. 서버(src/server)와 브라우저가 함께 쓴다

/** TV / 극장판은 필드명이 다르므로 한 곳에서 매핑한다 */
export const MEDIA = {
  tv: { label: 'TV 시리즈', title: 'name', original: 'original_name', date: 'first_air_date', dateParam: 'first_air_date' },
  movie: { label: '극장판', title: 'title', original: 'original_title', date: 'release_date', dateParam: 'primary_release_date' },
};

export function normalize(raw, type) {
  const m = MEDIA[type];
  const date = raw[m.date] || null;
  return {
    id: raw.id,
    title: raw[m.title],
    originalTitle: raw[m.original],
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

/** 검색 결과 · 링크 미리보기 설명(meta description)용 줄거리 — 150자까지 */
export const overviewSummary = (overview) =>
  (overview && overview.length > 150 ? `${overview.slice(0, 150)}…` : overview) || undefined;
