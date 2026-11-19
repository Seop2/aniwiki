import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Home from "@/components/ranking/Home";
import { parseHomeParams, toSearchParams } from "@/lib/paths";
import { listQueryKey } from "@/lib/queries";
import { fetchAnimePage } from "@/server/tmdb";

const homeParams = async (searchParams: PageProps<"/">["searchParams"]) =>
  parseHomeParams(toSearchParams(await searchParams));

export async function generateMetadata({
  searchParams,
}: PageProps<"/">): Promise<Metadata> {
  const { q } = await homeParams(searchParams);
  return {
    ...(q && { title: `“${q}” 검색 결과 - ANIWIKI` }),
    alternates: { canonical: "/" },
  };
}

export default async function Page({ searchParams }: PageProps<"/">) {
  const { type, sort, q, original, origin } = await homeParams(searchParams);
  const queryClient = new QueryClient();

  if (q || !original) {
    try {
      const page = await fetchAnimePage({
        type,
        sort,
        query: q,
        page: 1,
        origin,
      });
      queryClient.setQueryData(listQueryKey(type, q, sort, [], origin), {
        pages: [page],
        pageParams: [1],
      });
    } catch {}
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Home />
    </HydrationBoundary>
  );
}
