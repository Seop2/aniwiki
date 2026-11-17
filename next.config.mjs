/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/', has: [{ type: 'query', key: 'top10' }], destination: '/top10', permanent: true }];
  },
};

export default nextConfig;
