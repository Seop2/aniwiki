import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { buildNetflixOriginals } from "@/server/netflixOriginals";

export const revalidate = 86400;
/**
 * 넷플릭스 오리지널 목록
 * @returns
 */
export async function GET() {
  try {
    return Response.json(await buildNetflixOriginals());
  } catch (e) {
    if (process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) throw e;
    console.warn(
      `빈 netflix-originals.json으로 빌드합니다 (${(e as Error).message})`,
    );
    return Response.json([]);
  }
}
