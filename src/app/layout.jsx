// 공통 CSS를 컴포넌트 CSS보다 먼저 불러와야 컴포넌트 스타일이 공통 스타일을 덮어쓴다
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/ui.css';
import Providers from './providers';

const DESCRIPTION = '평점 · 인기 · 최신순으로 TV 시리즈와 극장판 애니메이션 랭킹을 한눈에 확인하세요.';
const OG_TITLE = 'ANIWIKI — 애니메이션 랭킹';
const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: 'ANIWIKI — 애니메이션 랭킹, 한눈에.' };

// 링크 미리보기 (카카오톡 · 슬랙 · 디스코드 등은 og:*, X는 twitter:*). metadataBase로 이미지가 절대 URL이 된다
export const metadata = {
  metadataBase: new URL('https://www.aniwiki.link'),
  title: 'ANIWIKI - 애니메이션 랭킹 · 평점 · 인기순',
  description: DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/favicon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: { other: { 'naver-site-verification': 'f9f68ac304b4c61ce300efb720548d4ef2c3e44f' } },
  openGraph: {
    type: 'website',
    siteName: 'ANIWIKI',
    locale: 'ko_KR',
    url: '/',
    title: OG_TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: { card: 'summary_large_image', title: OG_TITLE, description: DESCRIPTION, images: [OG_IMAGE.url] },
};

export const viewport = { themeColor: '#0f0f13' };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* 공유 이미지(Canvas)가 글꼴 이름으로 그리므로 next/font 대신 원래 이름 그대로 불러온다 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
