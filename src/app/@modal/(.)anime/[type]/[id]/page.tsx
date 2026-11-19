import DetailModal from "@/components/detail/DetailModal";
import { parseDetailParams } from "@/lib/paths";

export default async function Page({
  params,
}: PageProps<"/anime/[type]/[id]">) {
  const { type, id } = await params;
  const detail = parseDetailParams(type, id);
  if (!detail) return null;
  return (
    <DetailModal
      key={`${detail.type}-${detail.id}`}
      type={detail.type}
      id={detail.id}
    />
  );
}
