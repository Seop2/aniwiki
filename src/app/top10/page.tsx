import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SharedTop10 from "@/components/top10/SharedTop10";
import { toSearchParams } from "@/lib/paths";
import { parseShareUrl, shareQuery, top10Title } from "@/lib/share";

const sharedOf = async (searchParams: PageProps<"/top10">["searchParams"]) =>
  parseShareUrl(toSearchParams(await searchParams).toString());

export async function generateMetadata({
  searchParams,
}: PageProps<"/top10">): Promise<Metadata> {
  const shared = await sharedOf(searchParams);
  if (!shared) return {};
  const title = `${top10Title(shared.name)} - ANIWIKI`;
  const image = {
    url: `/api/og/top10?${shareQuery(shared)}`,
    width: 1200,
    height: 630,
    alt: title,
  };
  return {
    title,
    alternates: { canonical: "/" },
    openGraph: { title, images: [image] },
    twitter: { title, images: [image.url] },
  };
}

export default async function Page({ searchParams }: PageProps<"/top10">) {
  const shared = await sharedOf(searchParams);
  if (!shared) redirect("/");
  return <SharedTop10 shared={shared} />;
}
