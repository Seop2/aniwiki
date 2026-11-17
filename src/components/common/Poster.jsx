import { posterUrl } from '../../api/tmdb';

export default function Poster({ path, size = 'w92', className = 'poster', ...img }) {
  const src = posterUrl(path, size);
  return src
    ? <img className={className} src={src} alt="" {...img} />
    : <div className={`${className} poster-empty`} aria-hidden />;
}
