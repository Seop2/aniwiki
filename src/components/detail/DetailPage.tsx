import Link from 'next/link';
import type { MediaType } from '@/types';
import DetailContent from './DetailContent';

export default function DetailPage({ type, id }: { type: MediaType; id: number }) {
  return (
    <>
      <Link className="detail-page-back" href="/">← 랭킹 보기</Link>
      <article className="detail-page corners">
        <div className="detail-inner">
          <DetailContent type={type} id={id} />
        </div>
      </article>
    </>
  );
}
