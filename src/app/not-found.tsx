import Link from "next/link";
import { pageTitle } from "@/lib/site";

export const metadata = {
  title: { absolute: pageTitle("페이지를 찾을 수 없어요") },
};

export default function NotFound() {
  return (
    <section className="list-head">
      <div>
        <h2>페이지를 찾을 수 없어요</h2>
        <p>
          <Link href="/">랭킹으로 돌아가기 →</Link>
        </p>
      </div>
    </section>
  );
}
