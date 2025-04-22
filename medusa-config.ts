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
    smsc: {
      login: process.env.SMSC_LOGIN,
      password: process.env.SMSC_PASSWORD,
      sender: process.env.SMSC_SENDER || "Ugodo",
      apiUrl: process.env.SMSC_API_URL || "https://smsc.ru/sys/send.php"
    }
  },
  modules: [
    {
      resolve: "./src/modules/review",
    },
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
      resolve: `medusa-plugin-twilio-sms`,
      options: {
        account_sid: process.env.TWILIO_SMS_ACCOUNT_SID,
        auth_token: process.env.TWILIO_SMS_AUTH_TOKEN,
        from_number: process.env.TWILIO_SMS_FROM_NUMBER,
      },
    },
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
    {
      resolve: "./medusa/src/services/smsc",
      options: {
        // Опции будут переданы в сервис если необходимо
      },
      containerName: "smscService"
    }
  ]
}) 