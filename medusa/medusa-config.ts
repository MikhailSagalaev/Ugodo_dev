import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:8000,http://localhost:8001",
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
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
     resolve: "./src/modules/product-review", 
   }
 ],
  plugins: [
    {
      resolve: `medusa-plugin-custom-dashboard`,
      options: {
        enabled: true,
      },
    },
  ],
})