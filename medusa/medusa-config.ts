import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000,http://localhost:8001",
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS || "http://localhost:8000,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
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
            resolve: "@medusajs/medusa/file-s3",
            id: "minio",
            options: {
              file_url: process.env.MINIO_FILE_URL,
              access_key_id: process.env.MINIO_ACCESS_KEY_ID,
              secret_access_key: process.env.MINIO_SECRET_ACCESS_KEY,
              region: "us-east-1", // Для MinIO обычно используется us-east-1
              bucket: process.env.MINIO_BUCKET,
              endpoint: process.env.MINIO_ENDPOINT,
              additional_client_config: {
                forcePathStyle: true, // Необходимо для MinIO
              },
            },
          },
        ],
      },
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
          alwaysReturnSuccess: true,
          warnOnError: true
        }
      }
    }
  ],
})