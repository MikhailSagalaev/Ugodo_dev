import Medusa from "@medusajs/js-sdk"

// Приоритет переменных среды для определения URL бэкенда:
// 1. NEXT_PUBLIC_MEDUSA_BACKEND_URL (для фронтенда)
// 2. MEDUSA_BACKEND_URL (серверная)
// 3. Дефолт для разработки localhost:9000
// 4. Продакшен api.ugodo.ru

export let MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 
                               process.env.MEDUSA_BACKEND_URL || 
                               (process.env.NODE_ENV === "development" ? "http://localhost:9000" : "https://api.ugodo.ru")

console.log(`[Config] Using MEDUSA_BACKEND_URL: ${MEDUSA_BACKEND_URL}`)

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})
