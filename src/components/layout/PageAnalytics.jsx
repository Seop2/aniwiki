'use client';

import { Analytics } from '@vercel/analytics/react';
import { usePathname, useSearchParams } from 'next/navigation';

const DETAIL_RE = /^\/anime\/(tv|movie)\/\d+$/;

/**
 * route: 같은 화면끼리 묶이는 이름, path: Pages 패널에 찍히는 경로.
 * 숨은 명작은 고르기와 결과(?seen=…)를 나눠 세어야 결과까지 본 사람 수가 보인다
 */
export default function PageAnalytics() {
  const pathname = usePathname();
  const seen = useSearchParams().get('seen');

  const results = pathname === '/discover' && seen;
  const route = results ? '/discover/results' : DETAIL_RE.test(pathname) ? '/anime/[type]/[id]' : pathname;
  return <Analytics route={route} path={results ? '/discover/results' : pathname} />;
}
