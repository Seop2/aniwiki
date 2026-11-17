import DetailModal from '@/components/detail/DetailModal';
import { parseDetailParams } from '@/lib/paths';

/** 앱 안에서 /anime/…로 이동하면 페이지 대신 이 모달이 뜨고, 열기 전 화면은 뒤에 그대로 남는다 */
export default async function Page({ params }) {
  const { type, id } = await params;
  const detail = parseDetailParams(type, id);
  if (!detail) return null;
  return <DetailModal key={`${detail.type}-${detail.id}`} type={detail.type} id={detail.id} />;
}
