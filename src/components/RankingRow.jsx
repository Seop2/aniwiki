import { posterUrl } from '../api/tmdb';

export default function RankingRow({ rank, item, onSelect }) {
  const src = posterUrl(item.poster);
  const showOriginal = item.originalTitle && item.originalTitle !== item.title;

  return (
    <tr>
      <td className="col-rank">{rank}</td>
      <td className="col-title">
        <button type="button" className="title-cell title-button" onClick={() => onSelect(item)}>
          {src
            ? <img className="poster" src={src} alt="" loading="lazy" width="36" height="54" />
            : <div className="poster poster-empty" aria-hidden />}
          <div className="title-text">
            <strong>{item.title}</strong>
            {showOriginal && <span>{item.originalTitle}</span>}
            <span className="meta-mobile">{item.year} · {item.votes.toLocaleString()}표</span>
          </div>
        </button>
      </td>
      <td className="col-year">{item.year}</td>
      <td className="col-rating">{item.rating.toFixed(1)}</td>
      <td className="col-votes">{item.votes.toLocaleString()}표</td>
    </tr>
  );
}
