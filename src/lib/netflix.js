export const NETFLIX_NETWORK = 213;
export const NETFLIX_COMPANIES = [178464, 185004, 171251, 145174, 192478];
export const NETFLIX_PROVIDERS = [8, 1796];
const WORLDWIDE_RELEASE_COUNTRIES = 15;
const THEATRICAL_GRACE_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

function isNetflixFirstMovie(releaseDates) {
  const countries = releaseDates?.results ?? [];
  const isNetflix = (r) => r.type === 4 && r.note.trim().toLowerCase() === 'netflix';
  const netflixCountries = countries.filter((c) => c.release_dates.some(isNetflix)).length;
  if (netflixCountries < WORLDWIDE_RELEASE_COUNTRIES) return false;

  const earliest = (pred) => Math.min(...countries.flatMap((c) => c.release_dates.filter(pred).map((r) => Date.parse(r.release_date))));
  return earliest((r) => r.type === 3) + THEATRICAL_GRACE_DAYS * DAY >= earliest(isNetflix);
}

export function isNetflixOriginal({ networks = [], production_companies = [], release_dates }) {
  if (production_companies.some((c) => NETFLIX_COMPANIES.includes(c.id))) return true;
  if (networks.length === 1 && networks[0].id === NETFLIX_NETWORK) return true;
  return isNetflixFirstMovie(release_dates);
}
