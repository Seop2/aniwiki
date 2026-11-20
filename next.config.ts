import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://image.tmdb.org/t/p/**'), new URL('https://i.ytimg.com/vi/**')],
    minimumCacheTTL: 2678400,
  },
  async redirects() {
    return [{ source: '/', has: [{ type: 'query', key: 'top10' }], destination: '/top10', permanent: true }];
  },
};

export default nextConfig;
