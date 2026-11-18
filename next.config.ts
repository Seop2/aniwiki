import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/', has: [{ type: 'query', key: 'top10' }], destination: '/top10', permanent: true }];
  },
};

export default nextConfig;
