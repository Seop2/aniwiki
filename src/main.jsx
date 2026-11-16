import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// 공통 CSS를 App(컴포넌트 CSS)보다 먼저 불러와야 컴포넌트 스타일이 공통 스타일을 덮어쓴다
import './styles/tokens.css';
import './styles/base.css';
import './styles/ui.css';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
