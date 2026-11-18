import Link from 'next/link';
import type { AnimeSummary, MediaType } from '@/types';
import { detailPath } from '../../lib/paths';
import Poster from '../common/Poster';
import s from './RankingTable.module.css';

export default function RankingRow({ rank, item, type, onSelect }: {
  rank: number;
  item: AnimeSummary;
  type: MediaType;
  onSelect: (item: AnimeSummary) => void;
}) {
  const showOriginal = item.originalTitle && item.originalTitle !== item.title;

  return (
    <tr>
      <td className={s.rank}>{rank}</td>
      <td>
        <Link className="title-cell title-button" href={detailPath(type, item.id)} onClick={() => onSelect(item)}>
          <Poster path={item.poster} loading="lazy" width="36" height="54" />
          <div className="title-text">
            <strong>{item.title}</strong>
            {showOriginal && <span>{item.originalTitle}</span>}
            <span className={s.metaMobile}>{item.year} · {item.votes.toLocaleString()}표</span>
          </div>
        </Link>
      </td>
      <td className={s.year}>{item.year}</td>
      <td className={s.rating}>{item.rating.toFixed(1)}</td>
      <td className={s.votes}>{item.votes.toLocaleString()}표</td>
    </tr>
  );
}
