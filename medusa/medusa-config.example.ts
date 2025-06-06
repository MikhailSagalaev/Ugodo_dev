import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    // URL базы данных PostgreSQL
    databaseUrl: process.env.DATABASE_URL,
    http: {
      // CORS для фронтенда магазина
      storeCors: process.env.STORE_CORS || "http://localhost:8000,http://localhost:8001,http://localhost:9000",
      // CORS для админ панели
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:7000,http://localhost:8000",
      // CORS для аутентификации
      authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:9000", 
      // JWT секрет для токенов
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      // Секрет для cookies
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    // URL Redis для кэширования
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
  },
  admin: {
    // URL бэкенда для админ панели
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    vite: () => {
      return {
        server: {
          // Разрешенные хосты (измените на ваш домен)
          allowedHosts: ["ugodo.ru"],
        },
      }
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-s3",
            id: "s3",
            options: {
              // S3/MinIO настройки
              file_url: process.env.S3_URL,
              access_key_id: process.env.S3_ACCESS_KEY_ID,
              secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
              region: "us-east-1",
              bucket: process.env.S3_BUCKET,
              endpoint: process.env.S3_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true,
              },
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/inventory",
    },
    {
      resolve: "@medusajs/stock-location",
    },
    {
      resolve: "./src/modules/product-review", 
    },
    {
      resolve: "@medusajs/medusa/auth",
      options: {
        providers: [
          {
            id: "emailpass",
            resolve: "@medusajs/medusa/auth-emailpass",
            dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
          },
          {
            id: "otp",
            resolve: "@perseidesjs/auth-otp/providers/otp",
            dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
          },
        ],
      },
    },
    {
      resolve: "./src/modules/product-media",
      options: {},
      definition: {
        isQueryable: true
      }
    },
    {
      resolve: "./src/modules/product-video",
      options: {},
      definition: {
        isQueryable: true
      }
    },
  ],
  plugins: [
    {
      resolve: "@perseidesjs/auth-otp",
      options: {
        // Количество цифр в OTP коде
        digits: 6,
        // Время жизни OTP в секундах (5 минут)
        ttl: 60 * 5,
        // Настройки для разных типов пользователей
        accessorsPerActor: {
          customer: { accessor: 'phone', entityIdAccessor: 'phone' }
        },
        http: {
          warnOnError: true
        }
      }
    }
  ],
}) 