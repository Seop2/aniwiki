import { cache } from 'react';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import DetailPage from '@/components/detail/DetailPage';
import { posterUrl } from '@/lib/catalog';
import { detailPath, parseDetailParams } from '@/lib/paths';
import { detailQueryKey } from '@/lib/queryKeys';
import { fetchAnimeDetail, TmdbError } from '@/server/tmdb';

// 처음 요청될 때 만들고 10분(STALE_TIME.detail)마다 다시 만든다(ISR). 설정값은 숫자로 직접 써야 한다
export const revalidate = 600;
export const generateStaticParams = async () => [];

/** generateMetadata와 페이지가 같은 요청을 한 번만 하도록 */
const load = cache(async (rawType, rawId) => {
  const params = parseDetailParams(rawType, rawId);
  if (!params) notFound();
  try {
    return { ...params, data: await fetchAnimeDetail(params) };
  } catch (e) {
    if (e instanceof TmdbError && e.status === 404) notFound();
    throw e;
  }
});

const summary = (overview) => (overview && overview.length > 150 ? `${overview.slice(0, 150)}…` : overview);

export async function generateMetadata({ params }) {
  const { type: rawType, id: rawId } = await params;
  const { type, id, data } = await load(rawType, rawId);
  const title = `${data.title} - ANIWIKI`;
  // 검색 결과에 랭킹 소개 대신 작품 줄거리가 나오도록
  const description = summary(data.overview) || undefined;
  const image = posterUrl(data.backdrop, 'w780') ?? posterUrl(data.poster, 'w500');
  const images = image ? [{ url: image, alt: data.title }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: detailPath(type, id) },
    openGraph: { type: type === 'movie' ? 'video.movie' : 'video.tv_show', url: detailPath(type, id), title, description, images },
    twitter: { title, description, images: image ? [image] : undefined },
  };
}

export default async function Page({ params }) {
  const { type: rawType, id: rawId } = await params;
  const { type, id, data } = await load(rawType, rawId);

  // 받은 상세를 React Query 캐시에 넣어 브라우저가 같은 요청을 다시 하지 않게 한다
  const queryClient = new QueryClient();
  queryClient.setQueryData(detailQueryKey(type, id), data);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DetailPage type={type} id={id} />
    </HydrationBoundary>
  );
}
