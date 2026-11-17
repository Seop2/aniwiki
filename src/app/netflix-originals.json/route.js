import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { buildNetflixOriginals } from '@/server/netflixOriginals';

// 빌드 때 만들고 하루마다 다시 만든다. 후보 상세를 수백 건 받아야 해서 요청마다 만들 수는 없다
export const revalidate = 86400;

export async function GET() {
  try {
    return Response.json(await buildNetflixOriginals());
  } catch (e) {
    // 다시 만들다 실패하면 에러를 그대로 던진다 — Next가 직전 목록을 계속 내보낸다(빈 목록이 하루 동안 캐시되지 않게).
    // 직전 목록이 없는 빌드 때만 빈 목록으로 두고 빌드를 이어 간다
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw e;
    console.warn(`빈 netflix-originals.json으로 빌드합니다 (${e.message})`);
    return Response.json([]);
  }
}
