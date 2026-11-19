import { useState, useSyncExternalStore } from 'react';
import { track } from '@vercel/analytics';
import type { Top10Item } from '@/types';
import { useKakao } from '../../hooks/useKakao';
import { buildShareUrl, canShareLink, copyLink, shareImage, shareKakao, shareQuery, SITE_URL, top10Title, xIntentUrl } from '../../lib/share';
import { renderTop10Image } from '../../lib/top10Image';
import s from './ShareActions.module.css';

const noop = () => () => {};

const KakaoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7l-1 3.6c-.1.3.3.6.6.4l4.3-2.9c.5.1 1 .1 1.4.1 5.5 0 10-3.6 10-8S17.5 3 12 3z"/></svg>
);

export default function ShareActions({ name, items, disabled, center = false }: { name: string; items: Top10Item[]; disabled: boolean; center?: boolean }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const isClient = useSyncExternalStore(noop, () => true, () => false);
  const kakao = useKakao();

  const title = top10Title(name);
  const url = buildShareUrl({ name, items }, { local: isClient });

  const run = async (method: string, fn: () => string | void | Promise<string | void>) => {
    try {
      setStatus((await fn()) || '');
      track('top10_share', { method });
    } catch (e) {
      setStatus(e instanceof Error && e.name === 'AbortError' ? '' : '공유에 실패했어요. 다시 시도해 주세요.');
    }
  };

  const onImage = () =>
    run('image', async () => {
      setBusy(true);
      setStatus('이미지를 만드는 중…');
      try {
        const how = await shareImage(await renderTop10Image({ name, items }), { title, url });
        return how === 'download' ? '이미지를 저장했어요.' : '';
      } finally {
        setBusy(false);
      }
    });

  const onCopy = () => run('copy', async () => (await copyLink(url), '링크를 복사했어요.'));

  const onKakao = () =>
    run('kakao', () =>
      shareKakao({
        title,
        description: items.slice(0, 3).map((a) => a.title).join(' · '),
        imageUrl: `${SITE_URL}/api/og/top10?${shareQuery({ name, items })}`,
        url,
        buttonTitle: '나도 TOP 10 만들기',
      }));

  const onShare = () => run('native', async () => (await navigator.share({ title, text: title, url }), ''));

  return (
    <div>
      <div className={center ? `${s.buttons} ${s.center}` : s.buttons}>
        {kakao.enabled && (
          <button type="button" className="btn-kakao" onClick={onKakao} disabled={disabled || !kakao.ready}>
            <KakaoIcon />
            카카오톡
          </button>
        )}
        <button type="button" className="btn-primary" onClick={onImage} disabled={disabled || busy}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>
          이미지 저장
        </button>
        <button type="button" className="btn-outline" onClick={onCopy} disabled={disabled}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
          링크 복사
        </button>
        {isClient && canShareLink() && (
          <button type="button" className="btn-outline" onClick={onShare} disabled={disabled}>공유하기</button>
        )}
        <a
          className={`btn-outline${disabled ? ' is-disabled' : ''}`}
          href={xIntentUrl(`${title} #ANIWIKI`, url)}
          target="_blank"
          rel="noreferrer"
          aria-disabled={disabled}
          onClick={(e) => (disabled ? e.preventDefault() : track('top10_share', { method: 'x' }))}
        >
          X에 공유
        </a>
      </div>
      <p className={s.status} role="status">{status}</p>
    </div>
  );
}
