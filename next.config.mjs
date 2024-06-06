/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("@node-rs/argon2", "@node-rs/bcrypt");
    return config;
  },
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
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
