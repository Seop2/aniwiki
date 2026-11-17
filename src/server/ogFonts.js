import 'server-only';

export async function loadGoogleFont(family, weight, text) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weight}&text=${encodeURIComponent(text)}`,
    { next: { revalidate: 86400 } },
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`글꼴을 찾지 못했습니다: ${family}`);
  // 글꼴 파일 주소는 내용이 바뀌지 않으므로 받아 둔 것을 계속 쓴다
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`글꼴을 받지 못했습니다: ${family} ${res.status}`);
  return { name: family, weight, style: 'normal', data: await res.arrayBuffer() };
}
