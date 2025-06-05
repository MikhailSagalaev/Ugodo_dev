import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const TEST_MODE = process.env.SMS_TEST_MODE === 'true' || 
                 (process.env.NODE_ENV === 'development' && process.env.SMS_TEST_MODE !== 'false')
const TEST_OTP = '123456'

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<MedusaResponse> {
  if (!TEST_MODE) {
    return res.status(404).json({ error: "Test endpoint not available in production" })
  }

  try {
    const { identifier, otp } = req.body as { identifier: string; otp: string }

    console.log(`[Test OTP Authenticate] Received: identifier=${identifier}, otp=${otp}`)
    
    if (otp !== TEST_OTP) {
      console.log(`[Test OTP Authenticate] Invalid test OTP provided: ${otp}, expected: ${TEST_OTP}`)
      return res.status(400).json({ error: "Invalid OTP" })
    }

    // В тестовом режиме всегда возвращаем успешную авторизацию для созданного пользователя
    const authModuleService = req.scope.resolve(Modules.AUTH)
    
    // Находим auth identity
    const authIdentities = await authModuleService.listAuthIdentities({
      provider_identities: {
        entity_id: identifier,
        provider: "otp"
      }
    })

    if (authIdentities.length === 0) {
      return res.status(400).json({ error: "User not found" })
    }

    const authIdentity = authIdentities[0]
    
    // Генерируем JWT токен
    const jwt = require("jsonwebtoken")
    const customerId = authIdentity.app_metadata?.customer_id || authIdentity.app_metadata?.user_id
    
    // Получаем правильный JWT secret из конфигурации Medusa
    const { http } = req.scope.resolve("configModule").projectConfig
    const jwtSecret = http.jwtSecret
    
    const token = jwt.sign(
      {
        actor_id: customerId,
        actor_type: "customer",
        auth_identity_id: authIdentity.id,
      },
      jwtSecret,
      { expiresIn: http.jwtExpiresIn || "7d" }
    )

    console.log(`[Test OTP Authenticate] Success for identifier: ${identifier}, customer_id: ${customerId}`)
    
    return res.json({
      token,
      auth_identity: authIdentity
    })
  } catch (error) {
    console.error("[Test OTP Authenticate] Error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
} 