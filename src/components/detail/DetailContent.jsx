'use client';

import { useState } from 'react';
import { track } from '@vercel/analytics';
import { posterUrl } from '../../lib/catalog';
import { overviewSummary } from '../../lib/media';
import { detailPath } from '../../lib/paths';
import { copyLink, shareKakao, SITE_URL } from '../../lib/share';
import { useAnimeDetail } from '../../hooks/useAnimeDetail';
import { useKakao } from '../../hooks/useKakao';
import { KakaoIcon } from '../top10/ShareActions';
import Poster from '../common/Poster';
import { useAppState } from '../layout/AppState';
import './Detail.css';

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

function Share({ type, id, data }) {
  const kakao = useKakao();
  const [status, setStatus] = useState('');
  const url = SITE_URL + detailPath(type, id);

  const run = async (method, fn) => {
    try {
      setStatus((await fn()) || '');
      track('detail_share', { method });
    } catch {
      setStatus('공유에 실패했어요. 다시 시도해 주세요.');
    }
  };

  const onKakao = () =>
    run('kakao', () =>
      shareKakao({
        title: data.title,
        description: overviewSummary(data.overview) ?? '',
        imageUrl: posterUrl(data.backdrop, 'w780') ?? posterUrl(data.poster, 'w500'),
        url,
        buttonTitle: '작품 보기',
      }));

  const onCopy = () => run('copy', async () => (await copyLink(url), '링크를 복사했어요.'));

  return (
    <div className="detail-share">
      {kakao.enabled && (
        <button type="button" className="btn-kakao" onClick={onKakao} disabled={!data || !kakao.ready}>
          <KakaoIcon />
          카카오톡
        </button>
      )}
      <button type="button" className="btn-outline" onClick={onCopy}>링크 복사</button>
      <span role="status">{status}</span>
    </div>
  );
}

function Trailer({ video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="detail-video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1`}
          title={video.name}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`${video.name} 재생`}>
          <img src={`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`} alt="" loading="lazy" />
          <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.6)"/><path d="M10 8v8l6-4z" fill="#fff"/></svg>
        </button>
      )}
    </div>
  );
}

export default function DetailContent({ type, id, item }) {
  const { top10 } = useAppState();
  const { data, isPending, isError } = useAnimeDetail({ type, id });
  const d = data ?? item;

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
          <Share type={type} id={id} data={data} />
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

          {data.video && (
            <section className="detail-section">
              <h3>PV</h3>
              <Trailer key={data.video.key} video={data.video} />
            </section>
          )}

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
