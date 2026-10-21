import RankingRow from './RankingRow';

function Message({ children }) {
  return <tr><td colSpan={5} className="message">{children}</td></tr>;
}

function SkeletonRows({ count = 8 }) {
  return Array.from({ length: count }, (_, i) => (
    <tr key={i} className="skeleton" aria-hidden>
      <td className="col-rank"><i style={{ width: 16 }} /></td>
      <td className="col-title"><div className="title-cell"><i className="poster" /><i style={{ width: '50%' }} /></div></td>
      <td className="col-year"><i style={{ width: 36 }} /></td>
      <td className="col-rating"><i style={{ width: 28 }} /></td>
      <td className="col-votes"><i style={{ width: 48 }} /></td>
    </tr>
  ));
}

export default function RankingTable({ items, isPending, isError, error, hasNextPage, fetchNextPage, isFetchingNextPage, onSelect }) {
  const errorText = error?.message === 'MISSING_TOKEN'
    ? '.env 파일에 VITE_TMDB_TOKEN 또는 VITE_TMDB_API_KEY를 설정해 주세요.'
    : '데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';

  return (
    <>
      <div className="table-wrap corners">
        <table className="ranking">
          <thead>
            <tr>
              <th className="col-rank">순위</th>
              <th className="col-title">제목</th>
              <th className="col-year">연도</th>
              <th className="col-rating">평점</th>
              <th className="col-votes">투표수</th>
            </tr>
          </thead>
          <tbody>
            {isPending && <SkeletonRows />}
            {isError && <Message>{errorText}</Message>}
            {!isPending && !isError && items.length === 0 && <Message>검색 결과가 없습니다.</Message>}
            {items.map((item, i) => <RankingRow key={item.id} rank={i + 1} item={item} onSelect={onSelect} />)}
            {isFetchingNextPage && <SkeletonRows count={4} />}
          </tbody>
        </table>
      </div>

      {hasNextPage && (
        <div className="more">
          <button type="button" className="btn-outline btn-more" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? '불러오는 중…' : '더 보기'}
          </button>
        </div>
      )}
    </>
  );
}
