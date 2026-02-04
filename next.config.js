/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Exclude server-only packages from Edge Runtime
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
}

module.exports = nextConfig
