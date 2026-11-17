'use client';

import Link from 'next/link';

/**
 * 페이지를 그리다 난 오류(예: 작품 상세 SSR 중 TMDB 429 · 5xx). 헤더 · 검색창(layout)은 그대로 두고 본문만 바꾼다.
 * retry: 서버에서 다시 받아 그린다
 */
export default function Error({ retry }) {
  return (
    <section className="list-head">
      {/* metadata도 같은 오류로 만들지 못해 탭 제목이 비므로 직접 넣는다 */}
      <title>페이지를 불러오지 못했어요 - ANIWIKI</title>
      <div>
        <h2>페이지를 불러오지 못했어요</h2>
        <p className="message">잠시 후 다시 시도해 주세요.</p>
        <p>
          <button type="button" className="btn-primary" onClick={() => retry()}>다시 시도</button>{' '}
          <Link href="/">랭킹으로 돌아가기 →</Link>
        </p>
      </div>
    </section>
  );
}
