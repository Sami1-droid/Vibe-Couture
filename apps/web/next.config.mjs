/***** @type {import('next').NextConfig} *****/
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb'
    }
  },
  output: 'standalone',
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [{ source: '/api/:path*', destination: 'http://localhost:4000/api/:path*' }];
    }
    return [];
  }
};

export default nextConfig;