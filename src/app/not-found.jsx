import Link from 'next/link';

export const metadata = { title: '페이지를 찾을 수 없어요 - ANIWIKI' };

export default function NotFound() {
  return (
    <section className="list-head">
      <div>
        <h2>페이지를 찾을 수 없어요</h2>
        <p><Link href="/">랭킹으로 돌아가기 →</Link></p>
      </div>
    </section>
  );
}
