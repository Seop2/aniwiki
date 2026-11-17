'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function Providers({ children }) {
  // 요청마다 새 클라이언트를 만들지 않도록 state에 한 번만 만든다
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
  }));
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
