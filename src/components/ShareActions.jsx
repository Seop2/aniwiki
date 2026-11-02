import { useState } from 'react';
import { track } from '@vercel/analytics';
import { buildShareUrl, canShareLink, copyLink, shareImage, top10Title, xIntentUrl } from '../lib/share';
import { renderTop10Image } from '../lib/top10Image';

/** 이미지 저장/공유 · 링크 복사 · 시스템 공유 · X 공유 버튼 묶음 */
export default function ShareActions({ name, items, disabled }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const title = top10Title(name);
  const url = buildShareUrl({ name, items });

  const run = async (method, fn) => {
    try {
      setStatus((await fn()) || '');
      track('top10_share', { method });
    } catch (e) {
      // 공유 시트를 그냥 닫은 경우(AbortError)는 실패로 보지 않는다
      setStatus(e?.name === 'AbortError' ? '' : '공유에 실패했어요. 다시 시도해 주세요.');
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

  const onShare = () => run('native', async () => (await navigator.share({ title, text: title, url }), ''));

  return (
    <div className="share-actions">
      <div className="share-buttons">
        <button type="button" className="btn-primary" onClick={onImage} disabled={disabled || busy}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><rect x="3" y="3" width="18" height="18"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>
          이미지 저장
        </button>
        <button type="button" className="btn-outline" onClick={onCopy} disabled={disabled}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>
          링크 복사
        </button>
        {canShareLink() && (
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
      <p className="share-status" role="status">{status}</p>
    </div>
  );
}
