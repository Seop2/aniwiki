import type { AnimeItem } from "@/types";
import { SEED_BY_ID } from "@/data/seeds";
import { ANIMATION_GENRE_ID } from "./catalog";

export interface SeedList {
  seed: { id: number; title: string };
  items: AnimeItem[];
}

const GEM = {
  minVotes: 100,
  maxVotes: 1500,
  relaxedMaxVotes: 3000,
  minRating: 7.5,
  minAgeDays: 365,
  oldYear: 1995,
  oldFactor: 0.5,
  limit: 20,
  minResults: 8,
};

const RECAP_RE = /총집편|리캡|recap|특별편|OVA/i;

function rank(
  lists: SeedList[],
  exclude: Set<number>,
  maxVotes: number,
  today: number,
) {
  const cutoff = new Date(today - GEM.minAgeDays * 86400000)
    .toISOString()
    .slice(0, 10);
  const byId = new Map<
    number,
    { item: AnimeItem; weight: number; reasons: string[] }
  >();

  for (const { seed, items } of lists) {
    items.forEach((item, pos) => {
      if (
        exclude.has(item.id) ||
        item.originalLanguage !== "ja" ||
        !item.genreIds.includes(ANIMATION_GENRE_ID) ||
        item.votes < GEM.minVotes ||
        item.votes > maxVotes ||
        item.rating < GEM.minRating ||
        !item.date ||
        item.date > cutoff ||
        RECAP_RE.test(item.title ?? "")
      )
        return;

      const entry = byId.get(item.id) ?? { item, weight: 0, reasons: [] };
      entry.weight += 1 / (1 + pos / 10);
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

export function rankHiddenGems(
  lists: SeedList[],
  { exclude = new Set<number>(), today = Date.now() } = {},
) {
  const gems = rank(lists, exclude, GEM.maxVotes, today);
  return gems.length >= GEM.minResults
    ? gems
    : rank(lists, exclude, GEM.relaxedMaxVotes, today);
}

export function parseSeen(search: string) {
  const raw = new URLSearchParams(search).get("seen") ?? "";
  return [...new Set(raw.split(".").map(Number))].filter((id) =>
    SEED_BY_ID.has(id),
  );
}

export const discoverPath = (ids: number[]) =>
  ids.length ? `/discover?seen=${ids.join(".")}` : "/discover";
