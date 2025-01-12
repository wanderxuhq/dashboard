/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, isServer }) => {
    config.optimization.minimize = false;
    return config;
  },
}

module.exports = nextConfig 