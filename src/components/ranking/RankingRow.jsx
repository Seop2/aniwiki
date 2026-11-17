import Link from 'next/link';
import { detailPath } from '../../lib/paths';
import Poster from '../common/Poster';

export default function RankingRow({ rank, item, type, onSelect }) {
  const showOriginal = item.originalTitle && item.originalTitle !== item.title;

  return (
    <tr>
      <td className="col-rank">{rank}</td>
      <td className="col-title">
        <Link className="title-cell title-button" href={detailPath(type, item.id)} onClick={() => onSelect(item)}>
          <Poster path={item.poster} loading="lazy" width="36" height="54" />
          <div className="title-text">
            <strong>{item.title}</strong>
            {showOriginal && <span>{item.originalTitle}</span>}
            <span className="meta-mobile">{item.year} · {item.votes.toLocaleString()}표</span>
          </div>
        </Link>
      </td>
      <td className="col-year">{item.year}</td>
      <td className="col-rating">{item.rating.toFixed(1)}</td>
      <td className="col-votes">{item.votes.toLocaleString()}표</td>
    </tr>
  );
}
