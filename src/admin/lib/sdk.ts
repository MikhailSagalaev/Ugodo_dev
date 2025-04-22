import { adminClient } from "@medusajs/admin-sdk"

export type ClientScope = {
  resolve: <T>(...args: any[]) => T
}

export const sdk = {
  client: adminClient,
} 