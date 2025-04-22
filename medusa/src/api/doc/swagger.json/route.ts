import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { getSwaggerSpec } from "../route"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const swaggerSpec = getSwaggerSpec()
  res.setHeader("Content-Type", "application/json")
  res.send(swaggerSpec)
}

export const OPTIONS = async (req: MedusaRequest, res: MedusaResponse) => {
  res.json({ success: true })
} 