"use client";

import Link from "next/link";
import { pageTitle } from "@/lib/site";

export default function Error({ retry }: { retry: () => void }) {
  return (
    <section className="list-head">
      <title>{pageTitle("페이지를 불러오지 못했어요")}</title>
      <div>
        <h2>페이지를 불러오지 못했어요</h2>
        <p className="message">잠시 후 다시 시도해 주세요.</p>
        <p>
          <button type="button" className="btn-primary" onClick={() => retry()}>
            다시 시도
          </button>{" "}
          <Link href="/">랭킹으로 돌아가기 →</Link>
        </p>
      </div>
    </section>
  );
}
