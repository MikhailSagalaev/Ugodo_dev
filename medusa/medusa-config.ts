import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "https://ugodo.ru,https://www.ugodo.ru,https://api.ugodo.ru,http://localhost:8000",
      adminCors: process.env.ADMIN_CORS || "https://api.ugodo.ru,https://ugodo.ru,http://localhost:9000",
      authCors: process.env.AUTH_CORS || "https://ugodo.ru,https://api.ugodo.ru,http://localhost:8000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "https://api.ugodo.ru",
    vite: () => {
      return {
        server: {
          allowedHosts: ["ugodo.ru", "api.ugodo.ru", "www.ugodo.ru"],
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
        digits: 6,
        ttl: 60 * 5,
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