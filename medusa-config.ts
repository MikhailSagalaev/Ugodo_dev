import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: [
    process.env.REDIS_URL ? {
      resolve: "@medusajs/cache-redis",
      options: {
        redisUrl: process.env.REDIS_URL,
        ttl: 30,
      },
    } : {},
  ],
  plugins: [
    {
      resolve: `medusa-plugin-wishlist`,
      options: {
        enabled: true,
      },
    },
    {
      resolve: `medusa-plugin-custom-dashboard`,
      options: {
        enabled: true,
      },
    },
  ],
  services: [
    process.env.REDIS_URL ? {
      resolve: "./medusa/src/services/redis-cache",
      options: {
        ttl: 3600,
        namespace: "medusa:",
      },
      containerName: "cacheService"
    } : {
      resolve: "./medusa/src/services/cache",
      options: {},
      containerName: "cacheService"
    },
    {
      resolve: "./medusa/src/services/verification-code",
      options: {},
      containerName: "verificationCodeService"
    },
  ]
}) 