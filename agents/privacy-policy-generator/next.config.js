/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    ALCHEMYST_API_KEY: process.env.ALCHEMYST_API_KEY,
  },
}

module.exports = nextConfig