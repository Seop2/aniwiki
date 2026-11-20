"use client";

import Image from "next/image";
import type { AnimeDetail, AnimeSummary, MediaType } from "@/types";
import Poster from "@/components/common/Poster";
import { useAnimeDetail } from "@/hooks/useAnimeDetail";
import { posterUrl } from "@/lib/catalog";
import { TOP10_MAX } from "@/lib/share";
import { useInTop10, useTop10Store } from "@/stores/top10";
import Trailer from "./Trailer";
import s from "./Detail.module.css";

const laftelSearchUrl = (title: string) =>
  `https://laftel.net/search?keyword=${encodeURIComponent(title)}`;

type Shown = AnimeSummary & Partial<AnimeDetail>;

function metaOf(type: MediaType, d: Shown) {
  const parts: (string | null | undefined)[] = [d.year];
  if (type === "tv") {
    if (d.seasons) parts.push(`시즌 ${d.seasons}`);
    if (d.episodes) parts.push(`${d.episodes}화`);
    if (d.status) parts.push(d.status);
  } else if (d.runtime) {
    parts.push(`${d.runtime}분`);
  }
  return parts.filter(Boolean).join(" · ");
}

const DetailError = () => (
  <p className={s.empty}>
    상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
  </p>
);

const HeadSkeleton = () => (
  <div className={s.head} aria-hidden>
    <div className={s.poster} />
    <div className={`skeleton ${s.lines} ${s.info}`}>
      <i style={{ width: "70%" }} />
      <i style={{ width: "40%" }} />
      <i style={{ width: "30%" }} />
    </div>
  </div>
);

const BodySkeleton = () => (
  <div className={`skeleton ${s.lines}`} aria-hidden>
    <i style={{ width: "90%" }} />
    <i style={{ width: "80%" }} />
    <i style={{ width: "60%" }} />
  </div>
);

function Providers({ providers }: { providers: AnimeDetail["providers"] }) {
  if (!providers)
    return <p className={s.empty}>국내 시청 가능한 플랫폼 정보가 없습니다.</p>;

  return (
    <>
      {providers.groups.map((group) => (
        <div key={group.label} className={s.providerGroup}>
          <span className="field-label">{group.label}</span>
          <ul className={s.providerList}>
            {group.items.map((p) => (
              <li key={p.id} className={s.provider}>
                {p.logo ? (
                  <Image
                    src={posterUrl(p.logo, "w92")!}
                    alt=""
                    width={28}
                    height={28}
                  />
                ) : (
                  <i className={s.providerLogoEmpty} aria-hidden />
                )}
                <span>{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <a
        className={s.link}
        href={providers.link}
        target="_blank"
        rel="noreferrer"
      >
        TMDB에서 시청 링크 보기 →
      </a>
    </>
  );
}

function DetailHead({
  type,
  id,
  d,
  data,
}: {
  type: MediaType;
  id: number;
  d: Shown;
  data?: AnimeDetail;
}) {
  const { add, remove } = useTop10Store.getState();
  const count = useTop10Store((s) => s.items.length);
  const isFull = count >= TOP10_MAX;
  const showOriginal = d.originalTitle && d.originalTitle !== d.title;
  const inTop10 = useInTop10(type, id);

  return (
    <div className={s.head}>
      <Poster
        className={s.poster}
        path={d.poster}
        size="w342"
        width="140"
        height="210"
        loading="eager"
      />
      <div className={s.info}>
        <h2 id="detail-title">{d.title}</h2>
        {showOriginal && <p className={s.muted}>{d.originalTitle}</p>}
        <p className={s.muted}>{metaOf(type, d)}</p>
        <p className={s.rating}>
          <strong>{d.rating.toFixed(1)}</strong>
          <span>{d.votes.toLocaleString()}표</span>
        </p>
        {data?.netflixOriginal && (
          <span className={s.netflix}>넷플릭스 오리지널</span>
        )}
        {!!data?.genres.length && (
          <ul className={s.genres}>
            {data.genres.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        )}
        {!!data?.networks.length && (
          <p className={s.muted}>
            방송 · {data.networks.slice(0, 3).join(", ")}
            {data.networks.length > 3 && ` 외 ${data.networks.length - 3}곳`}
          </p>
        )}
        <div className={s.top10}>
          <button
            type="button"
            className={inTop10 ? "btn-outline" : "btn-primary"}
            onClick={() => (inTop10 ? remove(type, id) : add(type, d))}
            disabled={!inTop10 && isFull}
          >
            {inTop10 ? "TOP 10에서 빼기" : "내 TOP 10에 추가"}
          </button>
          <span>
            {!inTop10 && isFull
              ? "TOP 10이 가득 찼어요"
              : `${count}/${TOP10_MAX}`}
          </span>
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
        {data.tagline && <p className={s.tagline}>{data.tagline}</p>}
        <p className={s.overview}>
          {data.overview || "줄거리 정보가 없습니다."}
        </p>
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
        <a
          className={s.link}
          href={laftelSearchUrl(title)}
          target="_blank"
          rel="noreferrer"
        >
          라프텔에서 검색 →
        </a>
        <p className={s.note}>
          시청처는 TMDB(JustWatch) 기준이라 실제와 다를 수 있어요.
        </p>
      </section>

      {data.homepage && (
        <a
          className={s.link}
          href={data.homepage}
          target="_blank"
          rel="noreferrer"
        >
          공식 홈페이지 →
        </a>
      )}
    </>
  );
}

export default function DetailContent({
  type,
  id,
  item,
}: {
  type: MediaType;
  id: number;
  item?: AnimeSummary;
}) {
  const { data, isPending, isError } = useAnimeDetail({ type, id });
  const d = data ?? item;

  if (!d) return isError ? <DetailError /> : <HeadSkeleton />;

  return (
    <>
      {data?.backdrop && (
        <div
          className={s.backdrop}
          style={{
            backgroundImage: `url(${posterUrl(data.backdrop, "w780")})`,
          }}
          aria-hidden
        />
      )}
      <DetailHead type={type} id={id} d={d} data={data} />
      {isError ? (
        <DetailError />
      ) : isPending ? (
        <BodySkeleton />
      ) : (
        <DetailBody data={data!} title={d.title} />
      )}
    </>
  );
}
