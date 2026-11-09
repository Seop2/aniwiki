import { posterUrl } from '../api/tmdb';
import { detailPath, isPlainClick } from '../lib/router';

export default function RankingRow({ rank, item, type, onSelect }) {
  const src = posterUrl(item.poster);
  const showOriginal = item.originalTitle && item.originalTitle !== item.title;

  return (
    <tr>
      <td className="col-rank">{rank}</td>
      <td className="col-title">
        <a
          className="title-cell title-button"
          href={detailPath(type, item.id)}
          onClick={(e) => { if (isPlainClick(e)) { e.preventDefault(); onSelect(item); } }}
        >
          {src
            ? <img className="poster" src={src} alt="" loading="lazy" width="36" height="54" />
            : <div className="poster poster-empty" aria-hidden />}
          <div className="title-text">
            <strong>{item.title}</strong>
            {showOriginal && <span>{item.originalTitle}</span>}
            <span className="meta-mobile">{item.year} · {item.votes.toLocaleString()}표</span>
          </div>
        </a>
      </td>
      <td className="col-year">{item.year}</td>
      <td className="col-rating">{item.rating.toFixed(1)}</td>
      <td className="col-votes">{item.votes.toLocaleString()}표</td>
    </tr>
  );
}
