import { useEffect, useState } from 'react';
import { hasKakao, loadKakao } from '../lib/share';

export function useKakao() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasKakao) return;
    loadKakao().then(() => setReady(true), () => {});
  }, []);

  return { enabled: hasKakao, ready };
}
