import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import type { MediaType } from '@/types';
import { posterUrl } from '@/lib/catalog';
import { parseShareUrl } from '@/lib/share';
import { fetchAnimeDetail } from '@/server/tmdb';

const C = { bg: '#0f0f13', surface: '#17171d', line: '#24242c', text: '#ececf1', muted: '#8d8d99', accent: '#8b6dff', accentText: '#a48cff' };
const SANS = 'Noto Sans KR';
const DISPLAY = 'Barlow Condensed';
const HEADLINE = '인생 애니 TOP 10';

async function loadGoogleFont(family: string, weight: 600 | 800, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weight}&text=${encodeURIComponent(text)}`,
    { next: { revalidate: 86400 } },
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`글꼴을 찾지 못했습니다: ${family}`);
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`글꼴을 받지 못했습니다: ${family} ${res.status}`);
  return { name: family, weight, style: 'normal' as const, data: await res.arrayBuffer() };
}

// 글꼴에는 실제로 그리는 글자만 담는다
const loadFonts = (owner: string) => Promise.all([
  loadGoogleFont(SANS, 800, owner + HEADLINE),
  loadGoogleFont(DISPLAY, 600, 'ANIME / INDEX MY TOP 10 aniwiki.link 0123456789'),
]);

// 포스터를 data URL로 받아 둔다. 실패하면 그 칸만 비운다
async function loadPoster(item: { type: MediaType; id: number }) {
  try {
    const { poster } = await fetchAnimeDetail(item);
    if (!poster) return null;
    const res = await fetch(posterUrl(poster, 'w185')!, { cache: 'force-cache' });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? 'image/jpeg';
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const shared = parseShareUrl(request.nextUrl.search);
  if (!shared) return new Response('Bad Request', { status: 400 });

  const owner = `${shared.name.trim() || '나'}의`;
  const [fonts, posters] = await Promise.all([
    loadFonts(owner).catch((e) => {
      console.warn(`TOP 10 미리보기 이미지 대신 기본 이미지를 씁니다 (${(e as Error).message})`);
      return null;
    }),
    Promise.all(shared.items.map(loadPoster)),
  ]);
  // 글꼴 없이는 한글이 깨지므로 기본 미리보기 이미지로 보낸다(캐시하지 않아 다음 요청에서 다시 시도)
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
              <span style={{ fontSize: owner.length > 8 ? 36 : 48 }}>{owner}</span>
              <span style={{ fontSize: 48, whiteSpace: 'nowrap' }}>{HEADLINE}</span>
            </div>
            <div style={{ marginTop: 20, fontFamily: DISPLAY, fontSize: 28, color: C.muted, letterSpacing: 1 }}>aniwiki.link</div>
          </div>

          <div style={{ width: 528, display: 'flex', flexWrap: 'wrap', alignContent: 'center', gap: 12 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ position: 'relative', display: 'flex', width: 96, height: 144, background: C.line }}>
                {posters[i] && <img src={posters[i]} width={96} height={144} style={{ objectFit: 'cover' }} />}
                {i < shared.items.length && (
                  <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', padding: '2px 8px', background: C.accent, color: '#fff', fontFamily: DISPLAY, fontSize: 22 }}>
                    {i + 1}
                  </div>
                )}
              </div>
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
