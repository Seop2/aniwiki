import Icon from "@/components/common/Icon";
import Modal from "@/components/common/Modal";
import TitleCell, { yearAndType } from "@/components/common/TitleCell";
import { NAME_MAX, TOP10_MAX, top10Title } from "@/lib/share";
import { useTop10Store } from "@/stores/top10";
import { useUiStore } from "@/stores/ui";
import ShareActions from "./ShareActions";
import s from "./Top10Modal.module.css";

export default function Top10Modal() {
  const { name, items, move, remove, setName } = useTop10Store();
  const onClose = useUiStore((s) => s.closeTop10);

  return (
    <Modal className={s.dialog} labelledBy="top10-title" onClose={onClose}>
      <p className="eyebrow">
        MY TOP 10 · {items.length}/{TOP10_MAX}
      </p>
      <h2 id="top10-title" className={s.heading}>
        {top10Title(name)}
      </h2>

      <label className={`field ${s.name}`}>
        <span className="field-label">닉네임</span>
        <input
          type="text"
          value={name}
          maxLength={NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          placeholder="공유 이미지에 표시될 이름"
        />
      </label>

      {items.length === 0 ? (
        <p className={s.empty}>
          작품 상세에서 ‘내 TOP 10에 추가’를 눌러 담아보세요.
        </p>
      ) : (
        <ol className={s.list}>
          {items.map((a, i) => (
            <li key={`${a.type}-${a.id}`} className={s.item}>
              <span className={s.rank}>{i + 1}</span>
              <TitleCell poster={a.poster} title={a.title}>
                <span>{yearAndType(a.year, a.type)}</span>
              </TitleCell>
              <div className={s.controls}>
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`${a.title} 위로`}
                >
                  <Icon strokeWidth={2.2}>
                    <path d="m18 15-6-6-6 6" />
                  </Icon>
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label={`${a.title} 아래로`}
                >
                  <Icon strokeWidth={2.2}>
                    <path d="m6 9 6 6 6-6" />
                  </Icon>
                </button>
                <button
                  type="button"
                  onClick={() => remove(a.type, a.id)}
                  aria-label={`${a.title} 빼기`}
                >
                  <Icon strokeWidth={2.2}>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </Icon>
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
