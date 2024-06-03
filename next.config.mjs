/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb"
    }
  },
  async rewrites() {
    return [
      {
        source: '/api/umami',
        destination: 'https://umami-dadangdut33.vercel.app/script.js',
      },
    ]
  },
};

export default nextConfig;
