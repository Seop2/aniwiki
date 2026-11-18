'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/react';
import { usePathname, useSearchParams } from 'next/navigation';

const DETAIL_RE = /^\/anime\/(tv|movie)\/\d+$/;

const skipOwnVisits = (event: BeforeSendEvent) => {
  try {
    if (localStorage.getItem('va-disable')) return null;
  } catch {}
  return event;
};

export default function PageAnalytics() {
  const pathname = usePathname();
  const seen = useSearchParams().get('seen');

  const results = pathname === '/discover' && seen;
  const route = results ? '/discover/results' : DETAIL_RE.test(pathname) ? '/anime/[type]/[id]' : pathname;
  return <Analytics route={route} path={results ? '/discover/results' : pathname} beforeSend={skipOwnVisits} />;
}
