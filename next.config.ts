import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
}

export default nextConfig
