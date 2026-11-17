// React Query 키 중 서버 페이지(작품 상세 SSR)가 미리 채워 넣는 것. 서버 컴포넌트에서도 불러올 수 있게 훅과 분리한다
export const detailQueryKey = (type, id) => ['anime-detail', type, id];
