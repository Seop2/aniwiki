import { buildNetflixOriginals } from '../../../scripts/netflixOriginals.js';

// 빌드 때 만들고 하루마다 다시 만든다. 후보 상세를 수백 건 받아야 해서 요청마다 만들 수는 없다
export const revalidate = 86400;

export async function GET() {
  try {
    return Response.json(await buildNetflixOriginals(process.env));
  } catch (e) {
    console.warn(`빈 netflix-originals.json을 돌려줍니다 (${e.message})`);
    return Response.json([]);
  }
}
