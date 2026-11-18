'use client';

import { useState } from 'react';

export default function Trailer({ video }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="detail-video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1`}
          title={video.name}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`${video.name} 재생`}>
          <img src={`https://i.ytimg.com/vi/${video.key}/hqdefault.jpg`} alt="" loading="lazy" />
          <svg width="56" height="56" viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,.6)"/><path d="M10 8v8l6-4z" fill="#fff"/></svg>
        </button>
      )}
    </div>
  );
}
