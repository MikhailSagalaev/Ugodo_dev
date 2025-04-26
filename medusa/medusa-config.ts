import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
  modules: [
    {
      resolve: './src/modules/review',
    },
    {
      resolve: './src/modules/banner',
    },
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
        // Опции плагина, если нужны (по умолчанию обычно ничего не требуется)
        // enableUI: true, // Если плагин добавляет что-то в админку
      },
    },
    {
      resolve: `medusa-plugin-custom-dashboard`,
      options: {
        enabled: true,
      },
    },
    {
      resolve: `@appateam/medusa-plugin-product-reviews`,
      options: {
        enableUI: true
      }
    },
  ],
})