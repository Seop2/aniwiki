import { TOP10_MAX } from '../hooks/useMyTop10';

// 공유 링크: /?top10=t1429.m372058&name=닉네임 — 작품 ID만 담고 상세는 받는 쪽에서 TMDB로 불러온다
const PREFIX = { tv: 't', movie: 'm' };
const TYPE_OF = { t: 'tv', m: 'movie' };

// 배포본은 항상 정식 주소로 공유한다(미리보기 배포 URL이 퍼지지 않게). 로컬 개발 중에는 바로 열어볼 수 있게 현재 주소
const SITE_URL = 'https://www.aniwiki.link';
const shareOrigin = () => (import.meta.env.DEV ? location.origin : SITE_URL);

export const top10Title = (name) => `${name?.trim() || '나'}의 인생 애니 TOP 10`;

export function buildShareUrl({ name, items }) {
  const params = new URLSearchParams({ top10: items.map((a) => PREFIX[a.type] + a.id).join('.') });
  if (name?.trim()) params.set('name', name.trim());
  return `${shareOrigin()}/?${params}`;
}

/** 공유 링크가 아니거나 유효한 항목이 하나도 없으면 null */
export function parseShareUrl(search) {
  const params = new URLSearchParams(search);
  const raw = params.get('top10');
  if (!raw) return null;

  const seen = new Set();
  const items = [];
  for (const token of raw.split('.')) {
    const m = /^([tm])(\d{1,9})$/.exec(token);
    if (!m || seen.has(token)) continue;
    seen.add(token);
    items.push({ type: TYPE_OF[m[1]], id: Number(m[2]) });
    if (items.length === TOP10_MAX) break;
  }

  return items.length ? { name: (params.get('name') ?? '').slice(0, 20), items } : null;
}

/** 모바일은 시스템 공유 시트(이미지 첨부), 지원하지 않으면 파일로 내려받는다. 반환값: 'share' | 'download' */
export async function shareImage(blob, { title, url }) {
  const file = new File([blob], 'aniwiki-top10.png', { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text: `${title}\n${url}` });
      return 'share';
    } catch (e) {
      // 이미지 생성이 오래 걸려 사용자 제스처가 만료되면 NotAllowedError → 내려받기로 대체
      if (e?.name !== 'NotAllowedError') throw e;
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  return 'download';
}

export const canShareLink = () => typeof navigator !== 'undefined' && !!navigator.share;

export const copyLink = (url) => navigator.clipboard.writeText(url);

export const xIntentUrl = (text, url) =>
  `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url })}`;
