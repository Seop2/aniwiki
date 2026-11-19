import "server-only";
import { TmdbError } from "./tmdb";

export function parsePage(value: string | null) {
  const page = Number(value ?? 1);
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : null;
}

export const badRequest = () =>
  Response.json({ error: "BAD_REQUEST" }, { status: 400 });

export const cachedJson = (data: unknown, seconds: number) =>
  Response.json(data, {
    headers: {
      "Cache-Control": `public, s-maxage=${seconds}, stale-while-revalidate=86400`,
    },
  });

export function errorJson(e: unknown) {
  if (e instanceof Error && e.message === "MISSING_TOKEN")
    return Response.json({ error: "MISSING_TOKEN" }, { status: 500 });
  if (e instanceof TmdbError) {
    const status = e.status === 404 ? 404 : 502;
    return Response.json({ error: `TMDB ${e.status}` }, { status });
  }
  throw e;
}
