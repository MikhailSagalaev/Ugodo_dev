import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<MedusaResponse> {
  try {
    const { auth_identity_id, customer_id } = req.body as { 
      auth_identity_id: string; 
      customer_id: string 
    }

    console.log(`[Update Auth Identity] Linking auth_identity ${auth_identity_id} with customer ${customer_id}`)

    const authModuleService = req.scope.resolve(Modules.AUTH)
    
    // Обновляем auth_identity чтобы связать с customer
    await authModuleService.updateAuthIdentities({
      id: auth_identity_id,
      app_metadata: {
        customer_id: customer_id
      }
    })

    console.log(`[Update Auth Identity] Successfully linked`)

    return res.json({ 
      success: true, 
      message: "Auth identity updated successfully" 
    })
  } catch (error) {
    console.error("[Update Auth Identity] Error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
} 