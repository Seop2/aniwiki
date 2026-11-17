import { animePaths } from '../../scripts/sitemap.js';

const ORIGIN = 'https://www.aniwiki.link';
const STATIC_PATHS = ['/', '/discover'];

export const revalidate = 86400;

/** TMDB 요청이 실패해도 고정 주소만으로 sitemap.xml을 만든다 */
export default async function sitemap() {
  let anime = [];
  try {
    anime = await animePaths(process.env);
  } catch (e) {
    console.warn(`작품 주소 없이 sitemap.xml을 만듭니다 (${e.message})`);
  }
  const lastModified = new Date();
  return [...STATIC_PATHS, ...anime].map((p) => ({ url: `${ORIGIN}${p}`, lastModified }));
}
