import { redirect } from 'next/navigation';
import SharedTop10 from '@/components/top10/SharedTop10';
import { toSearchParams } from '@/lib/paths';
import { parseShareUrl, shareQuery, top10Title } from '@/lib/share';

const sharedOf = async (searchParams) => parseShareUrl(toSearchParams(await searchParams).toString());

export async function generateMetadata({ searchParams }) {
  const shared = await sharedOf(searchParams);
  if (!shared) return {};
  const title = `${top10Title(shared.name)} - ANIWIKI`;
  // 링크 미리보기에는 담긴 작품 포스터로 그린 이미지(api/og/top10)
  const image = { url: `/api/og/top10?${shareQuery(shared)}`, width: 1200, height: 630, alt: title };
  return {
    title,
    alternates: { canonical: '/' }, // 공유마다 내용이 바뀌는 화면이라 검색엔진에는 랭킹으로 묶는다
    openGraph: { title, images: [image] },
    twitter: { title, images: [image.url] },
  };
}

/** 공유 링크(/top10?top10=t1429.m372058&name=…)가 아니거나 유효한 항목이 없으면 랭킹으로 */
export default async function Page({ searchParams }) {
  const shared = await sharedOf(searchParams);
  if (!shared) redirect('/');
  return <SharedTop10 shared={shared} />;
}
