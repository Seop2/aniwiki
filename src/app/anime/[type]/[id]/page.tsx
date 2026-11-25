import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import DetailPage from "@/components/detail/DetailPage";
import { posterUrl } from "@/lib/catalog";
import { overviewSummary } from "@/lib/media";
import { detailPath, parseDetailParams } from "@/lib/paths";
import { detailQueryKey } from "@/lib/queries";
import { fetchAnimeDetail, TmdbError } from "@/server/tmdb";

export const revalidate = 600;
export const generateStaticParams = async () => [];

const load = cache(async (rawType: string, rawId: string) => {
  const params = parseDetailParams(rawType, rawId);
  if (!params) notFound();
  try {
    return { ...params, data: await fetchAnimeDetail(params) };
  } catch (e) {
    if (e instanceof TmdbError && e.status === 404) notFound();
    throw e;
  }
});

export async function generateMetadata({
  params,
}: PageProps<"/anime/[type]/[id]">): Promise<Metadata> {
  const { type: rawType, id: rawId } = await params;
  const { type, id, data } = await load(rawType, rawId);
  const title = data.title;
  const description = overviewSummary(data.overview);
  const image =
    posterUrl(data.backdrop, "w780") ?? posterUrl(data.poster, "w500");
  const images = image ? [{ url: image, alt: data.title }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: detailPath(type, id) },
    openGraph: {
      type: type === "movie" ? "video.movie" : "video.tv_show",
      url: detailPath(type, id),
      title,
      description,
      images,
    },
    twitter: { title, description, images: image ? [image] : undefined },
  };
}

/**
 * 작품 상세 페이지
 * @param param0
 * @returns
 */
export default async function Page({
  params,
}: PageProps<"/anime/[type]/[id]">) {
  const { type: rawType, id: rawId } = await params;
  const { type, id, data } = await load(rawType, rawId);

  const queryClient = new QueryClient();
  queryClient.setQueryData(detailQueryKey(type, id), data);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DetailPage type={type} id={id} />
    </HydrationBoundary>
  );
}
