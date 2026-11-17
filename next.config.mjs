/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // 예전 공유 링크(/?top10=…) → /top10?top10=… (쿼리는 그대로 넘어간다)
    return [{ source: '/', has: [{ type: 'query', key: 'top10' }], destination: '/top10', permanent: true }];
  },
};

export default nextConfig;
