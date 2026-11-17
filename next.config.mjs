/** @type {import('next').NextConfig} */
const nextConfig = {
  // 임시: TMDB 토큰이 아직 브라우저에서 쓰인다(2단계에서 서버로 옮기면 지운다)
  env: {
    NEXT_PUBLIC_TMDB_TOKEN: process.env.VITE_TMDB_TOKEN ?? '',
    NEXT_PUBLIC_TMDB_API_KEY: process.env.VITE_TMDB_API_KEY ?? '',
  },
};

export default nextConfig;
