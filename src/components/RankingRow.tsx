import Link from "next/link";
import type { AnimeSummary, MediaType } from "@/types";
import TitleCell from "@/components/common/TitleCell";
import { detailPath } from "@/lib/paths";
import s from "./RankingTable.module.css";

export default function RankingRow({
  rank,
  item,
  type,
  onSelect,
}: {
  rank: number;
  item: AnimeSummary;
  type: MediaType;
  onSelect: (item: AnimeSummary) => void;
}) {
  const showOriginal = item.originalTitle && item.originalTitle !== item.title;

  return (
    <tr>
      <td className="col-rank">{rank}</td>
      <td>
        <Link
          className="title-cell title-button"
          href={detailPath(type, item.id)}
          onClick={() => onSelect(item)}
        >
          <TitleCell poster={item.poster} title={item.title}>
            {showOriginal && <span>{item.originalTitle}</span>}
            <span className={s.metaMobile}>
              {item.year} · {item.votes.toLocaleString()}표
            </span>
          </TitleCell>
        </Link>
      </td>
      <td className={s.year}>{item.year}</td>
      <td className="col-rating">{item.rating.toFixed(1)}</td>
      <td className={s.votes}>{item.votes.toLocaleString()}표</td>
    </tr>
  );
}
