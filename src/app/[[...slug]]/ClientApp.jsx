'use client';

import dynamic from 'next/dynamic';

// 임시: 기존 SPA(App)를 브라우저에서만 그린다. 화면별 라우트로 옮기면 지운다
const App = dynamic(() => import('@/App'), { ssr: false });

export default function ClientApp() {
  return <App />;
}
