import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** 서버 렌더와 첫 하이드레이션에는 false, 그다음 true — 브라우저에만 있는 값(navigator, location)으로 그릴 때 */
export const useIsClient = () => useSyncExternalStore(subscribe, () => true, () => false);
