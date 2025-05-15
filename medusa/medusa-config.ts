import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET|| "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL!
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: process.env.MEDUSA_BACKEND_URL! + "/static",
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