import { SEED_BY_ID } from '../data/seeds';

// 숨은 명작 기준. 유명작은 투표가 2,000~8,000개라 1,500개 이하를 "덜 알려진" 작품으로 본다
export const GEM = {
  minVotes: 100, // 이보다 적으면 평점을 믿기 어렵다
  maxVotes: 1500,
  relaxedMaxVotes: 3000, // 결과가 너무 적을 때만 푼다
  minRating: 7.5,
  minAgeDays: 365, // 방영 직후에는 초반 팬 점수로 평점이 부풀려진다
  oldYear: 1995,
  oldFactor: 0.5, // 너무 오래된 작품이 위로 몰리지 않게
  limit: 20,
  minResults: 8,
};

const ANIMATION_GENRE_ID = 16;
const RECAP_RE = /총집편|리캡|recap|특별편|OVA/i;

function rank(lists, exclude, maxVotes, today) {
  const cutoff = new Date(today - GEM.minAgeDays * 86400000).toISOString().slice(0, 10);
  const byId = new Map();

  for (const { seed, items } of lists) {
    items.forEach((item, pos) => {
      if (
        exclude.has(item.id)
        || item.originalLanguage !== 'ja'
        || !item.genreIds.includes(ANIMATION_GENRE_ID)
        || item.votes < GEM.minVotes || item.votes > maxVotes
        || item.rating < GEM.minRating
        || !item.date || item.date > cutoff
        || RECAP_RE.test(item.title ?? '')
      ) return;

      const entry = byId.get(item.id) ?? { item, weight: 0, reasons: [] };
      entry.weight += 1 / (1 + pos / 10); // 추천 목록 앞쪽일수록 비중이 크다
      if (!entry.reasons.includes(seed.title)) entry.reasons.push(seed.title);
      byId.set(item.id, entry);
    });
  }

  return [...byId.values()]
    .map(({ item, weight, reasons }) => {
      const era = Number(item.year) < GEM.oldYear ? GEM.oldFactor : 1;
      return { item, reasons, score: weight * (item.rating - 7) * era };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, GEM.limit);
}

/**
 * lists: [{ seed: { id, title }, items: 추천 목록(순서 그대로) }]
 * 여러 시드에서 공통으로, 앞 순위로 추천될수록 점수가 높다. 결과가 너무 적으면 투표 상한을 풀어 다시 계산한다
 */
export function rankHiddenGems(lists, { exclude = new Set(), today = Date.now() } = {}) {
  const gems = rank(lists, exclude, GEM.maxVotes, today);
  return gems.length >= GEM.minResults ? gems : rank(lists, exclude, GEM.relaxedMaxVotes, today);
}

/** ?seen=1429.13916 → 고를 수 있는 시드 ID만, 중복 없이 */
export function parseSeen(search) {
  const raw = new URLSearchParams(search).get('seen') ?? '';
  return [...new Set(raw.split('.').map(Number))].filter((id) => SEED_BY_ID.has(id));
}

export const discoverPath = (ids) => (ids.length ? `/discover?seen=${ids.join('.')}` : '/discover');
