import type { ComponentProps } from 'react';
import { posterUrl } from '../../lib/catalog';

export default function Poster({ path, size = 'w92', className = 'poster', ...img }: { path: string | null; size?: string } & ComponentProps<'img'>) {
  const src = posterUrl(path, size);
  return src
    ? <img className={className} src={src} alt="" {...img} />
    : <div className={className} aria-hidden />;
}
