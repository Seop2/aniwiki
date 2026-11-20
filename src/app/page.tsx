import type { Metadata } from "next";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Home from "@/components/Home";
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

  //서버 QueryClient 생성
  const queryClient = new QueryClient();

  if (q || !original) {
    try {
      //랭킹 1페이지 받음
      const page = await fetchAnimePage({
        type,
        sort,
        query: q,
        page: 1,
        origin,
      });

      //임시 캐시에 저장
      queryClient.setQueryData(listQueryKey(type, q, sort, [], origin), {
        pages: [page],
        pageParams: [1],
      });
    } catch {}
  }

  return (
    //캐시를 JSON으로 바꿔 브라우저로
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Home />
    </HydrationBoundary>
  );
}
