// 넷플릭스 오리지널 판별. TMDB network 213(Netflix)만으로는 안 된다 — "어느 나라든 넷플릭스에서 방영"이라는 뜻이라
// 타코피의 원죄(방송사 21곳, 한국은 라프텔 독점)도 걸린다. 그래서 상세의 방송사 · 제작사 · 공개 기록으로 판별한다.
export const NETFLIX_NETWORK = 213;
// Netflix(US · JP), Netflix Animation Studios, Netflix International Pictures, Netflix Anime Creators' Base
export const NETFLIX_COMPANIES = [178464, 185004, 171251, 145174, 192478];
// 한국 넷플릭스(광고형 요금제 포함) watch provider
export const NETFLIX_PROVIDERS = [8, 1796];
// 극장판은 제작사에 넷플릭스가 없는 경우가 많다(케이팝 데몬 헌터스 = 소니). 대신 오리지널은
//  ① 200여 개국에 "Netflix" 디지털 공개로 기록되고(나중에 들어온 작품은 몇 나라뿐: 센과 치히로 3, 스즈메 8, 레오 19)
//  ② 일반 극장 개봉이 넷플릭스 공개보다 앞서지 않는다(반딧불의 묘 · 극장판 모노노케처럼 개봉 후 넷플릭스로 간 작품 제외)
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

/** 넷플릭스 제작사가 있거나, TV는 방송사가 넷플릭스 하나뿐, 극장판은 넷플릭스로 먼저 전 세계 공개됐으면 오리지널 */
export function isNetflixOriginal({ networks = [], production_companies = [], release_dates }) {
  if (production_companies.some((c) => NETFLIX_COMPANIES.includes(c.id))) return true;
  if (networks.length === 1 && networks[0].id === NETFLIX_NETWORK) return true;
  return isNetflixFirstMovie(release_dates);
}
