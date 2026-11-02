import { posterUrl } from '../api/tmdb';
import { top10Title } from './share';

// 공유용 이미지(인스타 피드 4:5). 사이트 다크 테마 색과 크롭 마크를 그대로 쓴다
const W = 1080;
const H = 1350;
const PAD = 72;
const C = {
  bg: '#0f0f13', surface: '#17171d', surface2: '#22222a', border: '#2e2e37',
  text: '#ececf1', muted: '#8d8d99', accent: '#8b6dff', accentText: '#a48cff',
};
const SANS = '"Pretendard Variable", Pretendard, system-ui, sans-serif';
const DISPLAY = '"Barlow Condensed", "Pretendard Variable", sans-serif';

const GRID_TOP = 300;
const GAP = 20;
const CARD_W = (W - PAD * 2 - GAP) / 2;
const CARD_H = 166;
const POSTER_W = 92;
const POSTER_H = 138;

function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous'; // image.tmdb.org는 CORS 허용 → canvas가 오염되지 않는다
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** 너비를 넘으면 글자 단위로 줄바꿈, maxLines를 넘으면 말줄임 */
function wrapText(ctx, text, maxWidth, maxLines) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line) {
      lines.push(line);
      line = ch.trimStart();
      if (lines.length === maxLines) break;
    } else {
      line += ch;
    }
  }
  if (lines.length < maxLines) {
    lines.push(line);
    return lines;
  }
  let last = lines[maxLines - 1];
  while (last && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
  lines[maxLines - 1] = last + '…';
  return lines;
}

function cornerMarks(ctx, x, y, w, h, size = 18) {
  ctx.fillStyle = C.text;
  for (const [cx, cy, dx, dy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
    ctx.fillRect(dx > 0 ? cx : cx - size, dy > 0 ? cy : cy - 2, size, 2);
    ctx.fillRect(dx > 0 ? cx : cx - 2, dy > 0 ? cy : cy - size, 2, size);
  }
}

function drawCard(ctx, x, y, rank, item, img) {
  ctx.fillStyle = C.surface;
  ctx.fillRect(x, y, CARD_W, CARD_H);
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, CARD_W - 2, CARD_H - 2);

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = rank <= 3 ? C.accentText : C.text;
  ctx.font = `700 64px ${DISPLAY}`;
  ctx.textAlign = 'center';
  ctx.fillText(String(rank), x + 44, y + CARD_H / 2 + 22);
  ctx.textAlign = 'left';

  if (!item) return;

  const px = x + 88;
  const py = y + (CARD_H - POSTER_H) / 2;
  if (img) {
    ctx.drawImage(img, px, py, POSTER_W, POSTER_H);
  } else {
    ctx.fillStyle = C.surface2;
    ctx.fillRect(px, py, POSTER_W, POSTER_H);
  }

  const tx = px + POSTER_W + 20;
  const maxW = x + CARD_W - 20 - tx;
  ctx.fillStyle = C.text;
  ctx.font = `700 27px ${SANS}`;
  const lines = wrapText(ctx, item.title ?? '', maxW, 2);
  const blockH = lines.length * 36 + 32;
  let ty = y + (CARD_H - blockH) / 2 + 28;
  for (const line of lines) {
    ctx.fillText(line, tx, ty);
    ty += 36;
  }
  ctx.fillStyle = C.muted;
  ctx.font = `500 22px ${SANS}`;
  ctx.fillText(`${item.year ?? ''}  ·  ${item.type === 'movie' ? '극장판' : 'TV'}`, tx, ty + 4);
}

/** items: [{ type, title, year, poster }] (최대 10개) → PNG Blob */
export async function renderTop10Image({ name, items }) {
  const title = top10Title(name);
  const allText = title + items.map((a) => a.title).join('') + '0123456789극장판TV·';

  // Pretendard dynamic-subset은 글자별로 폰트 파일을 나눠 받으므로 실제 쓸 글자를 넘겨 미리 받는다
  await Promise.all([
    document.fonts.load(`700 64px ${DISPLAY}`, '0123456789'),
    document.fonts.load(`600 30px ${DISPLAY}`, 'ANIWIKI MY TOP 10 aniwiki-kappa.vercel.app'),
    document.fonts.load(`700 27px ${SANS}`, allText),
    document.fonts.load(`500 22px ${SANS}`, allText),
  ]).catch(() => {});
  const images = await Promise.all(items.map((a) => loadImage(posterUrl(a.poster, 'w185'))));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W, 0, 0, W, 0, 700);
  glow.addColorStop(0, 'rgba(139, 109, 255, .22)');
  glow.addColorStop(1, 'rgba(139, 109, 255, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  cornerMarks(ctx, 32, 32, W - 64, H - 64);

  ctx.fillStyle = C.accentText;
  ctx.font = `600 30px ${DISPLAY}`;
  ctx.fillText('ANIWIKI  ·  MY TOP 10', PAD, PAD + 60);
  ctx.fillStyle = C.text;
  ctx.font = `700 60px ${SANS}`;
  ctx.fillText(wrapText(ctx, title, W - PAD * 2, 1)[0], PAD, PAD + 140);
  ctx.fillStyle = C.accent;
  ctx.fillRect(PAD, PAD + 172, 72, 6);

  for (let i = 0; i < 10; i++) {
    const col = Math.floor(i / 5); // 왼쪽 열 1~5위, 오른쪽 열 6~10위
    const row = i % 5;
    drawCard(ctx, PAD + col * (CARD_W + GAP), GRID_TOP + row * (CARD_H + GAP), i + 1, items[i], images[i]);
  }

  ctx.fillStyle = C.muted;
  ctx.font = `500 24px ${SANS}`;
  ctx.fillText('나만의 TOP 10 만들기 →', PAD, H - 66);
  ctx.textAlign = 'right';
  ctx.fillStyle = C.text;
  ctx.font = `600 28px ${DISPLAY}`;
  ctx.fillText('aniwiki-kappa.vercel.app', W - PAD, H - 66);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('IMAGE_FAILED'))), 'image/png'),
  );
}
