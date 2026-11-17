'use client';

import { posterUrl } from '../../lib/catalog';
import { useAnimeDetail } from '../../hooks/useAnimeDetail';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import Poster from '../common/Poster';
import { useAppState } from '../layout/AppState';
import './DetailModal.css';

// TMDB 시청처(JustWatch)에는 라프텔이 없어 검색 결과로 보낸다 — 작품이 있는지는 보장하지 않음
const laftelSearchUrl = (title) => `https://laftel.net/search?keyword=${encodeURIComponent(title)}`;

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

/** 상세 모달 · 상세 페이지가 함께 쓰는 본문. item: 목록에서 연 경우의 항목(상세가 오기 전에 먼저 그린다) */
export default function DetailContent({ type, id, item }) {
  const { top10 } = useAppState();
  const { data, isPending, isError } = useAnimeDetail({ type, id });
  const d = data ?? item; // 상세가 오기 전에는 목록에서 가진 정보로 먼저 그린다

  // 검색 결과에 랭킹 소개 대신 작품 줄거리가 나오도록
  const overview = d?.overview;
  useDocumentMeta({
    title: d?.title && `${d.title} - ANIWIKI`,
    description: overview && (overview.length > 150 ? `${overview.slice(0, 150)}…` : overview),
  });

  const showOriginal = d?.originalTitle && d.originalTitle !== d.title;
  const inTop10 = top10.has(type, id);

  return (
    <>
      {data?.backdrop && (
        <div className="detail-backdrop" style={{ backgroundImage: `url(${posterUrl(data.backdrop, 'w780')})` }} aria-hidden />
      )}

      {!d ? (
        isError
          ? <p className="detail-empty">상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>
          : (
            <div className="detail-head" aria-hidden>
              <div className="detail-poster poster-empty" />
              <div className="skeleton detail-skeleton detail-info">
                <i style={{ width: '70%' }} /><i style={{ width: '40%' }} /><i style={{ width: '30%' }} />
              </div>
            </div>
          )
      ) : (
      <div className="detail-head">
        <Poster className="detail-poster" path={d.poster} size="w342" width="140" height="210" />
        <div className="detail-info">
          <h2 id="detail-title">{d.title}</h2>
          {showOriginal && <p className="detail-original">{d.originalTitle}</p>}
          <p className="detail-meta">{metaOf(type, d)}</p>
          <p className="detail-rating">
            <strong>{d.rating.toFixed(1)}</strong>
            <span>{d.votes.toLocaleString()}표</span>
          </p>
          {data?.netflixOriginal && <span className="badge-netflix">넷플릭스 오리지널</span>}
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
              onClick={() => (inTop10 ? top10.remove(type, id) : top10.add(type, d))}
              disabled={!inTop10 && top10.isFull}
            >
              {inTop10 ? 'TOP 10에서 빼기' : '내 TOP 10에 추가'}
            </button>
            <span>{!inTop10 && top10.isFull ? 'TOP 10이 가득 찼어요' : `${top10.items.length}/10`}</span>
          </div>
        </div>
      </div>
      )}

      {!d ? null : isError ? (
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
            <a className="detail-link" href={laftelSearchUrl(d.title)} target="_blank" rel="noreferrer">
              라프텔에서 검색 →
            </a>
            <p className="detail-note">시청처는 TMDB(JustWatch) 기준이라 실제와 다를 수 있어요.</p>
          </section>

          {data.homepage && (
            <a className="detail-link" href={data.homepage} target="_blank" rel="noreferrer">공식 홈페이지 →</a>
          )}
        </>
      )}
    </>
  );
}
