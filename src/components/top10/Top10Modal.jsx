import { MEDIA } from '../../api/tmdb';
import { TOP10_MAX, top10Title } from '../../lib/share';
import Modal from '../common/Modal';
import Poster from '../common/Poster';
import ShareActions from './ShareActions';
import './Top10Modal.css';

export default function Top10Modal({ top10, onClose }) {
  const { name, items, move, remove, setName } = top10;

  return (
    <Modal className="top10" labelledBy="top10-title" onClose={onClose}>
      <p className="eyebrow">MY TOP 10 · {items.length}/{TOP10_MAX}</p>
      <h2 id="top10-title" className="top10-heading">{top10Title(name)}</h2>

      <label className="field top10-name">
        <span className="field-label">닉네임</span>
        <input
          type="text"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          placeholder="공유 이미지에 표시될 이름"
        />
      </label>

      {items.length === 0 ? (
        <p className="top10-empty">작품 상세에서 ‘내 TOP 10에 추가’를 눌러 담아보세요.</p>
      ) : (
        <ol className="top10-list">
          {items.map((a, i) => (
            <li key={`${a.type}-${a.id}`} className="top10-item">
              <span className="top10-rank">{i + 1}</span>
              <Poster path={a.poster} width="36" height="54" loading="lazy" />
              <div className="title-text">
                <strong>{a.title}</strong>
                <span>{a.year} · {MEDIA[a.type].label}</span>
              </div>
              <div className="top10-controls">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${a.title} 위로`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="m18 15-6-6-6 6"/></svg>
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`${a.title} 아래로`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="m6 9 6 6 6-6"/></svg>
                </button>
                <button type="button" onClick={() => remove(a.type, a.id)} aria-label={`${a.title} 빼기`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <section className="detail-section">
        <h3>SHARE</h3>
        <ShareActions name={name} items={items} disabled={items.length === 0} />
      </section>
    </Modal>
  );
}
