import { posterUrl } from '../../api/tmdb';

/** TMDB 포스터. 이미지가 없는 작품은 같은 크기의 빈 칸 */
export default function Poster({ path, size = 'w92', className = 'poster', ...img }) {
  const src = posterUrl(path, size);
  return src
    ? <img className={className} src={src} alt="" {...img} />
    : <div className={`${className} poster-empty`} aria-hidden />;
}
