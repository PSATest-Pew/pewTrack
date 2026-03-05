/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: false, // Use pages directory
  },
  env: {
    NO_DB: process.env.NO_DB || 'false',
  },
}

module.exports = nextConfig