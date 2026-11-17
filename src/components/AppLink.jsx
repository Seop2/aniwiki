import { isPlainClick } from '../lib/router';

/** 앱 안에서 이동하는 링크. 일반 클릭은 onNavigate로 처리하고, ⌘/Ctrl/휠 클릭(새 탭)은 브라우저에 맡긴다 */
export default function AppLink({ onNavigate, ...props }) {
  return (
    <a
      {...props}
      onClick={(e) => {
        if (!isPlainClick(e)) return;
        e.preventDefault();
        onNavigate(e);
      }}
    />
  );
}
