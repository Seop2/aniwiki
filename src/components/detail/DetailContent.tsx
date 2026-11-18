'use client';

import type { AnimeDetail, AnimeSummary, MediaType } from '@/types';
import { posterUrl } from '../../lib/catalog';
import { useAnimeDetail } from '../../hooks/useAnimeDetail';
import Poster from '../common/Poster';
import { useAppState } from '../layout/AppState';
import Trailer from './Trailer';
import './Detail.css';

const laftelSearchUrl = (title: string) => `https://laftel.net/search?keyword=${encodeURIComponent(title)}`;

type Shown = AnimeSummary & Partial<AnimeDetail>;

function metaOf(type: MediaType, d: Shown) {
  const parts: (string | null | undefined)[] = [d.year];
  if (type === 'tv') {
    if (d.seasons) parts.push(`시즌 ${d.seasons}`);
    if (d.episodes) parts.push(`${d.episodes}화`);
    if (d.status) parts.push(d.status);
  } else if (d.runtime) {
    parts.push(`${d.runtime}분`);
  }
  return parts.filter(Boolean).join(' · ');
}

const DetailError = () => <p className="detail-empty">상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>;

const HeadSkeleton = () => (
  <div className="detail-head" aria-hidden>
    <div className="detail-poster poster-empty" />
    <div className="skeleton detail-skeleton detail-info">
      <i style={{ width: '70%' }} /><i style={{ width: '40%' }} /><i style={{ width: '30%' }} />
    </div>
  </div>
);

const BodySkeleton = () => (
  <div className="skeleton detail-skeleton" aria-hidden>
    <i style={{ width: '90%' }} /><i style={{ width: '80%' }} /><i style={{ width: '60%' }} />
  </div>
);

function Providers({ providers }: { providers: AnimeDetail['providers'] }) {
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
                  ? <img src={posterUrl(p.logo, 'w92')!} alt="" width="40" height="40" loading="lazy" />
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

function DetailHead({ type, id, d, data }: { type: MediaType; id: number; d: Shown; data?: AnimeDetail }) {
  const { top10 } = useAppState();
  const showOriginal = d.originalTitle && d.originalTitle !== d.title;
  const inTop10 = top10.has(type, id);

  return (
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
        {!!data?.genres.length && (
          <ul className="genre-list">
            {data.genres.map((g) => <li key={g}>{g}</li>)}
          </ul>
        )}
        {!!data?.networks.length && (
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
  );
}

function DetailBody({ data, title }: { data: AnimeDetail; title: string }) {
  return (
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
        <a className="detail-link" href={laftelSearchUrl(title)} target="_blank" rel="noreferrer">
          라프텔에서 검색 →
        </a>
        <p className="detail-note">시청처는 TMDB(JustWatch) 기준이라 실제와 다를 수 있어요.</p>
      </section>

      {data.homepage && (
        <a className="detail-link" href={data.homepage} target="_blank" rel="noreferrer">공식 홈페이지 →</a>
      )}
    </>
  );
}

export default function DetailContent({ type, id, item }: { type: MediaType; id: number; item?: AnimeSummary }) {
  const { data, isPending, isError } = useAnimeDetail({ type, id });
  const d = data ?? item;

  if (!d) return isError ? <DetailError /> : <HeadSkeleton />;

  return (
    <>
      {data?.backdrop && (
        <div className="detail-backdrop" style={{ backgroundImage: `url(${posterUrl(data.backdrop, 'w780')})` }} aria-hidden />
      )}
      <DetailHead type={type} id={id} d={d} data={data} />
      {isError ? <DetailError /> : isPending ? <BodySkeleton /> : <DetailBody data={data!} title={d.title} />}
    </>
  );
}
