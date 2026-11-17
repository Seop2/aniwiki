import { ImageResponse } from 'next/og';
import { posterUrl } from '@/lib/catalog';
import { parseShareUrl } from '@/lib/share';
import { loadGoogleFont } from '@/server/ogFonts';
import { fetchAnimeDetail } from '@/server/tmdb';

const C = { bg: '#0f0f13', surface: '#17171d', line: '#24242c', text: '#ececf1', muted: '#8d8d99', accent: '#8b6dff', accentText: '#a48cff' };
const POSTER = { width: 96, height: 144 };

const SANS = 'Noto Sans KR';
const DISPLAY = 'Barlow Condensed';

const HEADLINE = '인생 애니 TOP 10';
const LATIN = 'ANIME / INDEX MY TOP 10 aniwiki.link 0123456789';

// 글꼴에는 실제로 그리는 글자만 담는다
const loadFonts = (owner) => Promise.all([
  loadGoogleFont(SANS, 800, owner + HEADLINE),
  loadGoogleFont(DISPLAY, 600, LATIN),
]);

// 포스터를 미리 받아 data URL로 넘긴다. 한 장이 실패해도 그 칸만 비운다
async function posterData(path) {
  const url = posterUrl(path, 'w185');
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? 'image/jpeg';
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

function PosterTile({ src, rank }) {
  return (
    <div style={{ position: 'relative', display: 'flex', ...POSTER, background: C.line }}>
      {src && <img src={src} width={POSTER.width} height={POSTER.height} style={{ objectFit: 'cover' }} />}
      {rank && (
        <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', padding: '2px 8px', background: C.accent, color: '#fff', fontFamily: DISPLAY, fontSize: 22 }}>
          {rank}
        </div>
      )}
    </div>
  );
}

export async function GET(request) {
  const shared = parseShareUrl(request.nextUrl.search);
  if (!shared) return new Response('Bad Request', { status: 400 });

  const owner = `${shared.name.trim() || '나'}의`;
  const ownerSize = owner.length > 8 ? 36 : 48;

  const [posters, fonts] = await Promise.all([
    Promise.all(shared.items.map((it) => fetchAnimeDetail(it).then((d) => posterData(d.poster)).catch(() => null))),
    loadFonts(owner).catch((e) => {
      // 글꼴 없이는 한글이 깨지므로 사이트 기본 미리보기 이미지로 보낸다(캐시하지 않아 다음 요청에서 다시 시도)
      console.warn(`TOP 10 미리보기 이미지 대신 기본 이미지를 씁니다 (${e.message})`);
      return null;
    }),
  ]);
  if (!fonts) return Response.redirect(new URL('/og-image.png', request.url), 307);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.text, fontFamily: SANS }}>
        <div style={{ width: 1104, height: 534, display: 'flex', gap: 48, padding: 56, background: C.surface, border: `1px solid ${C.line}` }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: DISPLAY, fontSize: 32, letterSpacing: 1.5 }}>
              <div style={{ width: 20, height: 20, border: `3px solid ${C.accent}` }} />
              ANIME / INDEX
            </div>
            <div style={{ marginTop: 'auto', fontFamily: DISPLAY, fontSize: 28, letterSpacing: 3, color: C.accentText }}>MY TOP 10</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', fontWeight: 800, lineHeight: 1.2, letterSpacing: -1.5 }}>
              <span style={{ fontSize: ownerSize }}>{owner}</span>
              <span style={{ fontSize: 48, whiteSpace: 'nowrap' }}>{HEADLINE}</span>
            </div>
            <div style={{ marginTop: 20, fontFamily: DISPLAY, fontSize: 28, color: C.muted, letterSpacing: 1 }}>aniwiki.link</div>
          </div>

          <div style={{ width: 528, display: 'flex', flexWrap: 'wrap', alignContent: 'center', gap: 12 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <PosterTile key={i} src={posters[i]} rank={i < shared.items.length ? i + 1 : null} />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    },
  );
}
