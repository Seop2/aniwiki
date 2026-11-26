import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { animePaths } from "@/server/sitemapPaths";

const STATIC_PATHS = ["/", "/discover"];

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let anime: string[] = [];
  try {
    anime = await animePaths();
  } catch (e) {
    console.warn(
      `작품 주소 없이 sitemap.xml을 만듭니다 (${(e as Error).message})`,
    );
  }
  const lastModified = new Date();
  return [...STATIC_PATHS, ...anime].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified,
  }));
}
