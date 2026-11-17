import { redirect } from 'next/navigation';
import SharedTop10 from '@/components/top10/SharedTop10';
import { toSearchParams } from '@/lib/paths';
import { parseShareUrl, top10Title } from '@/lib/share';

const sharedOf = async (searchParams) => parseShareUrl(toSearchParams(await searchParams).toString());

export async function generateMetadata({ searchParams }) {
  const shared = await sharedOf(searchParams);
  if (!shared) return {};
  const title = `${top10Title(shared.name)} - ANIWIKI`;
  return {
    title,
    alternates: { canonical: '/' }, // 공유마다 내용이 바뀌는 화면이라 검색엔진에는 랭킹으로 묶는다
    openGraph: { title },
    twitter: { title },
  };
}

/** 공유 링크(/top10?top10=t1429.m372058&name=…)가 아니거나 유효한 항목이 없으면 랭킹으로 */
export default async function Page({ searchParams }) {
  const shared = await sharedOf(searchParams);
  if (!shared) redirect('/');
  return <SharedTop10 shared={shared} />;
}
