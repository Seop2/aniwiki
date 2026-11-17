import { ImageResponse } from 'next/og';
import { posterUrl } from '@/lib/catalog';
import { parseShareUrl, top10Title } from '@/lib/share';
import { loadGoogleFont } from '@/server/ogFonts';
import { fetchAnimeDetail } from '@/server/tmdb';

// 공유 TOP 10 링크 미리보기(카카오톡 · X 등) — 1200×630, 왼쪽 제목 · 오른쪽 포스터 5×2. 색은 다크 테마 토큰과 같다
const C = { bg: '#0f0f13', surface: '#17171d', line: '#24242c', text: '#ececf1', muted: '#8d8d99', accent: '#8b6dff', accentText: '#a48cff' };
const POSTER = { width: 96, height: 144 };

const SANS = 'Noto Sans KR';
const DISPLAY = 'Barlow Condensed';

export async function GET(request) {
  const shared = parseShareUrl(request.nextUrl.search);
  if (!shared) return new Response('Bad Request', { status: 400 });

  // 상세 페이지와 같은 캐시를 쓴다. 실패한 작품은 빈 칸으로
  const items = await Promise.all(shared.items.map((it) => fetchAnimeDetail(it).catch(() => null)));
  const title = top10Title(shared.name);
  // 닉네임(최대 20자)과 「인생 애니 TOP 10」을 줄을 나눠 그린다. 긴 닉네임은 글자를 줄여 영역 안에 넣는다
  const owner = `${shared.name.trim() || '나'}의`;
  const ownerSize = owner.length > 8 ? 36 : 48;

  const fonts = await Promise.all([
    loadGoogleFont(SANS, 800, title),
    loadGoogleFont(DISPLAY, 600, 'ANIME / INDEX MY TOP 10 aniwiki.link 0123456789'),
  ]);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg, color: C.text, fontFamily: SANS }}>
        <div style={{ width: 1104, height: 534, display: 'flex', gap: 48, padding: '56px 56px', background: C.surface, border: `1px solid ${C.line}` }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: DISPLAY, fontSize: 32, letterSpacing: 1.5 }}>
              <div style={{ width: 20, height: 20, border: `3px solid ${C.accent}` }} />
              ANIME / INDEX
            </div>
            <div style={{ marginTop: 'auto', fontFamily: DISPLAY, fontSize: 28, letterSpacing: 3, color: C.accentText }}>MY TOP 10</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', fontWeight: 800, lineHeight: 1.2, letterSpacing: -1.5 }}>
              <span style={{ fontSize: ownerSize }}>{owner}</span>
              <span style={{ fontSize: 48, whiteSpace: 'nowrap' }}>인생 애니 TOP 10</span>
            </div>
            <div style={{ marginTop: 20, fontFamily: DISPLAY, fontSize: 28, color: C.muted, letterSpacing: 1 }}>aniwiki.link</div>
          </div>

          <div style={{ width: 528, display: 'flex', flexWrap: 'wrap', alignContent: 'center', gap: 12 }}>
            {Array.from({ length: 10 }, (_, i) => {
              const src = posterUrl(items[i]?.poster, 'w185');
              return (
                <div key={i} style={{ position: 'relative', display: 'flex', ...POSTER, background: C.line }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {src && <img src={src} width={POSTER.width} height={POSTER.height} style={{ objectFit: 'cover' }} />}
                  {i < shared.items.length && (
                    <div style={{ position: 'absolute', left: 0, top: 0, display: 'flex', padding: '2px 8px', background: C.accent, color: '#fff', fontFamily: DISPLAY, fontSize: 22 }}>
                      {i + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      // 같은 링크는 같은 이미지 — 하루 동안 CDN에 둔다
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    },
  );
}
