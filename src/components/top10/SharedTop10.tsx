'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import type { AnimeDetail, MediaType } from '@/types';
import { MEDIA } from '../../lib/catalog';
import { animeDetailQuery } from '../../hooks/useAnimeDetail';
import { type parseShareUrl, top10Title } from '../../lib/share';
import { detailPath } from '../../lib/paths';
import { useAppState } from '../layout/AppState';
import Poster from '../common/Poster';
import ShareActions from './ShareActions';
import s from './SharedTop10.module.css';
import t from '../ranking/RankingTable.module.css';

export default function SharedTop10({ shared }: { shared: NonNullable<ReturnType<typeof parseShareUrl>> }) {
  const router = useRouter();
  const { openDetail, openTop10 } = useAppState();

  const results = useQueries({
    queries: shared.items.map(({ type, id }) => animeDetailQuery(type, id)),
  });

  const isPending = results.some((r) => r.isPending);
  const loaded = results
    .map((r, i) => r.data && { ...r.data, type: shared.items[i].type })
    .filter((d): d is AnimeDetail & { type: MediaType } => !!d);

  return (
    <section>
      <div className={`list-head ${s.head}`}>
        <div>
          <p className="eyebrow">SHARED · TOP 10</p>
          <h2>{top10Title(shared.name)}</h2>
        </div>
        <button type="button" className="btn-primary corners" onClick={() => { router.push('/'); openTop10(); }}>나도 만들기</button>
      </div>

      <div className={`${t.wrap} corners`}>
        <table className={t.ranking}>
          <tbody>
            {results.map((r, i) => {
              const { type } = shared.items[i];
              const d = r.data;
              return (
                <tr key={`${type}-${shared.items[i].id}`} className={d ? '' : 'skeleton'} aria-hidden={!d || undefined}>
                  <td className={t.rank}>{i + 1}</td>
                  <td>
                    {d ? (
                      <Link
                        className="title-cell title-button"
                        href={detailPath(type, d.id)}
                        onClick={() => openDetail(type, d)}
                      >
                        <Poster path={d.poster} width="36" height="54" />
                        <div className="title-text">
                          <strong>{d.title}</strong>
                          <span>{d.year} · {MEDIA[type].label}</span>
                        </div>
                      </Link>
                    ) : r.isError ? (
                      <span className={s.missing}>작품 정보를 불러오지 못했어요.</span>
                    ) : (
                      <div className="title-cell"><i className="poster" /><i style={{ width: '50%' }} /></div>
                    )}
                  </td>
                  <td className={t.rating}>{d && d.rating.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={s.share}>
        <ShareActions name={shared.name} items={loaded} disabled={isPending || loaded.length === 0} center />
      </div>
    </section>
  );
}
