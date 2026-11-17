import 'server-only';

/**
 * ImageResponse(satori)에 넣을 글꼴. 기본 글꼴에는 한글이 없어 Google Fonts에서 그 이미지에 쓰는 글자만 받아 온다.
 * woff2는 satori가 읽지 못하므로 User-Agent 없이 요청해 TrueType을 받는다
 */
export async function loadGoogleFont(family, weight, text) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weight}&text=${encodeURIComponent(text)}`,
    { next: { revalidate: 86400 } },
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`글꼴을 찾지 못했습니다: ${family}`);
  return { name: family, weight, style: 'normal', data: await fetch(url).then((r) => r.arrayBuffer()) };
}
