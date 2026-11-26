import type { ReactNode } from "react";
import type { MediaType } from "@/types";
import { MEDIA } from "@/lib/catalog";
import Poster from "./Poster";

export const yearAndType = (year: string, type: MediaType) =>
  `${year} · ${MEDIA[type].label}`;

export default function TitleCell({
  poster,
  title,
  children,
}: {
  poster: string | null;
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      <Poster path={poster} width="36" height="54" loading="lazy" />
      <div className="title-text">
        <strong>{title}</strong>
        {children}
      </div>
    </>
  );
}

export const TitleCellSkeleton = () => (
  <div className="title-cell">
    <i className="poster" />
    <i style={{ width: "50%" }} />
  </div>
);
