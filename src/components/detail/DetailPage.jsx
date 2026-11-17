import Link from 'next/link';
import DetailContent from './DetailContent';

/** 상세 주소로 바로 들어왔을 때(검색 · 공유 링크 · 새 탭)의 페이지. 데이터는 서버가 미리 채워 둔다 */
export default function DetailPage({ type, id }) {
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
