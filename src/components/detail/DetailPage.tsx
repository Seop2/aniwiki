import Link from "next/link";
import type { MediaType } from "@/types";
import DetailContent from "./DetailContent";
import s from "./Detail.module.css";

export default function DetailPage({
  type,
  id,
}: {
  type: MediaType;
  id: number;
}) {
  return (
    <>
      <Link className={s.back} href="/">
        ← 랭킹 보기
      </Link>
      <article className={`${s.page} corners`}>
        <div className="detail-inner">
          <DetailContent type={type} id={id} asPage />
        </div>
      </article>
    </>
  );
}
