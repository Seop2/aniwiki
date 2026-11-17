import 'server-only';

export async function loadGoogleFont(family, weight, text) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replaceAll(' ', '+')}:wght@${weight}&text=${encodeURIComponent(text)}`,
    { next: { revalidate: 86400 } },
  ).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`글꼴을 찾지 못했습니다: ${family}`);
  return { name: family, weight, style: 'normal', data: await fetch(url).then((r) => r.arrayBuffer()) };
}
