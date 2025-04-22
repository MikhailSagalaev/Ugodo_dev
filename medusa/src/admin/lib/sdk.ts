import { defineRouteConfig, defineWidgetConfig } from "@medusajs/admin-sdk"
import Medusa from "@medusajs/medusa-js"

const client = new Medusa({ 
  baseUrl: import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000",
  maxRetries: 3,
})

export type ClientScope = {
  resolve: <T>(...args: any[]) => T
}

export const sdk = {
  client: client,
} 