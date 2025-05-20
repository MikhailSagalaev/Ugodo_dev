const checkEnvVariables = require("./check-env-variables")

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {},
    optimizeCss: true,
    scrollRestoration: true,
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "medusa-public-images.s3.eu-west-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "medusa-server-testing.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.builder.io",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
    minimumCacheTTL: 60,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Не включаем cloudflare:sockets на клиенте
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "cloudflare:sockets": false,
      }
    }
    
    // Оптимизация бандла
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    }
    
    return config
  },
}

checkEnvVariables()

module.exports = nextConfig
