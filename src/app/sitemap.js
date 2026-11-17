import { animePaths } from '@/server/sitemapPaths';

const ORIGIN = 'https://www.aniwiki.link';
const STATIC_PATHS = ['/', '/discover'];

export const revalidate = 86400;

export default async function sitemap() {
  let anime = [];
  try {
    anime = await animePaths();
  } catch (e) {
    console.warn(`작품 주소 없이 sitemap.xml을 만듭니다 (${e.message})`);
  }
  const lastModified = new Date();
  return [...STATIC_PATHS, ...anime].map((p) => ({ url: `${ORIGIN}${p}`, lastModified }));
}
