import { useQueries } from '@tanstack/react-query';
import { fetchAnimeDetail, posterUrl, MEDIA } from '../api/tmdb';
import { top10Title } from '../lib/share';
import { detailPath, isPlainClick } from '../lib/router';
import ShareActions from './ShareActions';

/** 공유 링크(/top10?top10=...)로 들어왔을 때의 읽기 전용 화면 */
export default function SharedTop10({ shared, onSelect, onCreate }) {
  // DetailModal(useAnimeDetail)과 같은 queryKey → 항목을 눌러 상세를 열 때 다시 요청하지 않는다
  const results = useQueries({
    queries: shared.items.map(({ type, id }) => ({
      queryKey: ['anime-detail', type, id],
      queryFn: () => fetchAnimeDetail({ type, id }),
      staleTime: 1000 * 60 * 10,
    })),
  });

  const isPending = results.some((r) => r.isPending);
  const loaded = results
    .map((r, i) => r.data && { ...r.data, type: shared.items[i].type })
    .filter(Boolean);

  return (
    <section className="shared">
      <div className="list-head shared-head">
        <div>
          <p className="eyebrow">SHARED · TOP 10</p>
          <h2>{top10Title(shared.name)}</h2>
        </div>
        <button type="button" className="btn-primary corners" onClick={onCreate}>나도 만들기</button>
      </div>

      <div className="table-wrap corners">
        <table className="ranking">
          <tbody>
            {results.map((r, i) => {
              const { type } = shared.items[i];
              const d = r.data;
              return (
                <tr key={`${type}-${shared.items[i].id}`} className={d ? '' : 'skeleton'} aria-hidden={!d || undefined}>
                  <td className="col-rank">{i + 1}</td>
                  <td className="col-title">
                    {d ? (
                      <a
                        className="title-cell title-button"
                        href={detailPath(type, d.id)}
                        onClick={(e) => { if (isPlainClick(e)) { e.preventDefault(); onSelect({ type, item: d }); } }}
                      >
                        {d.poster
                          ? <img className="poster" src={posterUrl(d.poster)} alt="" width="36" height="54" />
                          : <div className="poster poster-empty" aria-hidden />}
                        <div className="title-text">
                          <strong>{d.title}</strong>
                          <span>{d.year} · {MEDIA[type].label}</span>
                        </div>
                      </a>
                    ) : r.isError ? (
                      <span className="shared-missing">작품 정보를 불러오지 못했어요.</span>
                    ) : (
                      <div className="title-cell"><i className="poster" /><i style={{ width: '50%' }} /></div>
                    )}
                  </td>
                  <td className="col-rating">{d && d.rating.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="shared-share">
        <ShareActions name={shared.name} items={loaded} disabled={isPending || loaded.length === 0} />
      </div>
    </section>
  );
}
