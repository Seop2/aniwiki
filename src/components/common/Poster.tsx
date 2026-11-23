import Image, { type ImageProps } from "next/image";
import { posterUrl } from "@/lib/catalog";

export default function Poster({
  path,
  size = "w92",
  className = "poster",
  alt = "",
  ...img
}: { path: string | null; size?: string; alt?: string } & Omit<
  ImageProps,
  "src" | "alt"
>) {
  const src = posterUrl(path, size);
  return src ? (
    <Image className={className} src={src} alt={alt} {...img} />
  ) : (
    <div className={className} aria-hidden />
  );
}
