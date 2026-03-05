/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NO_DB: process.env.NO_DB || 'false',
  },
  // Exclude server-side files from Next.js build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        'better-sqlite3': false,
      };
    }
    return config;
  },
}

module.exports = nextConfig