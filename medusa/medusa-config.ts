import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000,http://localhost:8001,http://localhost:9000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:7000,http://localhost:8000",
      authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
    vite: () => {
      return {
        server: {
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