export const NETFLIX_NETWORK = 213;
const NETFLIX_COMPANIES = [178464, 185004, 171251, 145174, 192478];
export const NETFLIX_PROVIDERS = [8, 1796];
const WORLDWIDE_RELEASE_COUNTRIES = 15;
const THEATRICAL_GRACE_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

interface ReleaseDate {
  type: number;
  note: string;
  release_date: string;
}

export interface TmdbReleaseDates {
  results: { iso_3166_1: string; release_dates: ReleaseDate[] }[];
}

function isNetflixFirstMovie(releaseDates: TmdbReleaseDates | undefined) {
  const countries = releaseDates?.results ?? [];
  const isNetflix = (r: ReleaseDate) =>
    r.type === 4 && r.note.trim().toLowerCase() === "netflix";
  const netflixCountries = countries.filter((c) =>
    c.release_dates.some(isNetflix),
  ).length;
  if (netflixCountries < WORLDWIDE_RELEASE_COUNTRIES) return false;

  const earliest = (pred: (r: ReleaseDate) => boolean) =>
    Math.min(
      ...countries.flatMap((c) =>
        c.release_dates.filter(pred).map((r) => Date.parse(r.release_date)),
      ),
    );
  return (
    earliest((r) => r.type === 3) + THEATRICAL_GRACE_DAYS * DAY >=
    earliest(isNetflix)
  );
}

export function isNetflixOriginal({
  networks = [],
  production_companies = [],
  release_dates,
}: {
  networks?: { id: number }[];
  production_companies?: { id: number }[];
  release_dates?: TmdbReleaseDates;
}) {
  if (production_companies.some((c) => NETFLIX_COMPANIES.includes(c.id)))
    return true;
  if (networks.length === 1 && networks[0].id === NETFLIX_NETWORK) return true;
  return isNetflixFirstMovie(release_dates);
}
