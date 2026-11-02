import { useEffect, useRef } from 'react';
import { posterUrl } from '../api/tmdb';
import { useAnimeDetail } from '../hooks/useAnimeDetail';

function metaOf(type, d) {
  const parts = [d.year];
  if (type === 'tv') {
    if (d.seasons) parts.push(`시즌 ${d.seasons}`);
    if (d.episodes) parts.push(`${d.episodes}화`);
    if (d.status) parts.push(d.status);
  } else if (d.runtime) {
    parts.push(`${d.runtime}분`);
  }
  return parts.filter(Boolean).join(' · ');
}

function Providers({ providers }) {
  if (!providers) return <p className="detail-empty">국내 시청 가능한 플랫폼 정보가 없습니다.</p>;

  return (
    <>
      {providers.groups.map((group) => (
        <div key={group.label} className="provider-group">
          <span className="field-label">{group.label}</span>
          <ul className="provider-list">
            {group.items.map((p) => (
              <li key={p.id} className="provider">
                {p.logo
                  ? <img src={posterUrl(p.logo, 'w92')} alt="" width="40" height="40" loading="lazy" />
                  : <i className="provider-logo-empty" aria-hidden />}
                <span>{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <a className="detail-link" href={providers.link} target="_blank" rel="noreferrer">
        TMDB에서 시청 링크 보기 →
      </a>
    </>
  );
}

export default function DetailModal({ type, item, top10, onClose }) {
  const ref = useRef(null);
  const { data, isPending, isError } = useAnimeDetail({ type, id: item.id });
  const d = data ?? item; // 상세가 오기 전에는 목록에서 가진 정보로 먼저 그린다

  useEffect(() => {
    const dialog = ref.current;
    // close()는 부르지 않는다 — StrictMode 재실행 시 close 이벤트가 onClose를 불러 모달이 바로 닫힌다.
    // 언마운트로 DOM에서 빠지면 모달 상태도 함께 해제된다.
    if (!dialog.open) dialog.showModal();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const src = posterUrl(d.poster, 'w342');
  const showOriginal = d.originalTitle && d.originalTitle !== d.title;
  const inTop10 = top10.has(type, d.id);

  return (
    <dialog
      ref={ref}
      className="detail"
      aria-labelledby="detail-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()} // 백드롭 클릭
    >
      <div className="detail-inner">
        <button type="button" className="detail-close" onClick={onClose} aria-label="닫기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>

        {data?.backdrop && (
          <div className="detail-backdrop" style={{ backgroundImage: `url(${posterUrl(data.backdrop, 'w780')})` }} aria-hidden />
        )}

        <div className="detail-head">
          {src
            ? <img className="detail-poster" src={src} alt="" width="140" height="210" />
            : <div className="detail-poster poster-empty" aria-hidden />}
          <div className="detail-info">
            <h2 id="detail-title">{d.title}</h2>
            {showOriginal && <p className="detail-original">{d.originalTitle}</p>}
            <p className="detail-meta">{metaOf(type, d)}</p>
            <p className="detail-rating">
              <strong>{d.rating.toFixed(1)}</strong>
              <span>{d.votes.toLocaleString()}표</span>
            </p>
            {data?.genres.length > 0 && (
              <ul className="genre-list">
                {data.genres.map((g) => <li key={g}>{g}</li>)}
              </ul>
            )}
            {data?.networks.length > 0 && (
              <p className="detail-sub">
                방송 · {data.networks.slice(0, 3).join(', ')}
                {data.networks.length > 3 && ` 외 ${data.networks.length - 3}곳`}
              </p>
            )}
            <div className="detail-top10">
              <button
                type="button"
                className={inTop10 ? 'btn-outline' : 'btn-primary'}
                onClick={() => (inTop10 ? top10.remove(type, d.id) : top10.add(type, d))}
                disabled={!inTop10 && top10.isFull}
              >
                {inTop10 ? 'TOP 10에서 빼기' : '내 TOP 10에 추가'}
              </button>
              <span>{!inTop10 && top10.isFull ? 'TOP 10이 가득 찼어요' : `${top10.items.length}/10`}</span>
            </div>
          </div>
        </div>

        {isError ? (
          <p className="detail-empty">상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
        ) : isPending ? (
          <div className="skeleton detail-skeleton" aria-hidden>
            <i style={{ width: '90%' }} /><i style={{ width: '80%' }} /><i style={{ width: '60%' }} />
          </div>
        ) : (
          <>
            <section className="detail-section">
              <h3>줄거리</h3>
              {data.tagline && <p className="detail-tagline">{data.tagline}</p>}
              <p className="detail-overview">{data.overview || '줄거리 정보가 없습니다.'}</p>
            </section>

            <section className="detail-section">
              <h3>시청 가능 플랫폼</h3>
              <Providers providers={data.providers} />
            </section>

            {data.homepage && (
              <a className="detail-link" href={data.homepage} target="_blank" rel="noreferrer">공식 홈페이지 →</a>
            )}
          </>
        )}
      </div>
    </dialog>
  );
}
