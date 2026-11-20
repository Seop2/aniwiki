"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MediaType } from "@/types";
import Modal from "@/components/common/Modal";
import { useAnimeDetail } from "@/hooks/useAnimeDetail";
import { overviewSummary } from "@/lib/media";
import { useUiStore } from "@/stores/ui";
import DetailContent from "./DetailContent";

export default function DetailModal({
  type,
  id,
}: {
  type: MediaType;
  id: number;
}) {
  const router = useRouter();
  const preview = useUiStore((s) => s.preview);
  const closing = useRef(false);

  const item =
    preview?.type === type && preview.item.id === id ? preview.item : undefined;

  const { data } = useAnimeDetail({ type, id });
  const title = (data ?? item)?.title;
  const description = overviewSummary(data?.overview);

  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = `${title} - ANIWIKI`;
    return () => {
      document.title = prev;
    };
  }, [title]);

  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    if (!meta || !description) return;
    const prev = meta.content;
    meta.content = description;
    return () => {
      meta.content = prev;
    };
  }, [description]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    router.back();
  };

  return (
    <Modal labelledBy="detail-title" onClose={close}>
      <DetailContent type={type} id={id} item={item} />
    </Modal>
  );
}
