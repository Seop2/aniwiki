import Discover from '@/components/discover/Discover';
import { parseSeen } from '@/lib/discover';
import { toSearchParams } from '@/lib/paths';

export const metadata = {
  title: '숨은 명작 찾기 - ANIWIKI',
  description: '원피스 · 진격의 거인처럼 본 유명작을 고르면, 그 팬들이 본 덜 알려진 명작 애니메이션을 추천해 드려요.',
  alternates: { canonical: '/discover' },
};

export default async function Page({ searchParams }) {
  const seen = parseSeen(toSearchParams(await searchParams).toString());
  return <Discover seen={seen} />;
}
