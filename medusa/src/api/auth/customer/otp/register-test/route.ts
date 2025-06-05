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

    console.log(`[Test OTP Register] Received: identifier=${identifier}, otp=${otp}`)
    
    if (otp !== TEST_OTP) {
      console.log(`[Test OTP Register] Invalid test OTP provided: ${otp}, expected: ${TEST_OTP}`)
      return res.status(400).json({ error: "Invalid OTP" })
    }

    // В тестовом режиме всегда возвращаем регистрационный токен
    const authModuleService = req.scope.resolve(Modules.AUTH)
    
    // Создаем auth identity для нового пользователя
    const authIdentity = await authModuleService.createAuthIdentities({
      provider_identities: [
        {
          provider: "otp",
          entity_id: identifier,
          provider_metadata: {
            verified: true,
            otp_hash: "test_mode"
          }
        }
      ],
      app_metadata: {
        user_id: null // будет установлен после создания customer
      }
    })

    // Генерируем registration token
    const jwt = require("jsonwebtoken")
    
    // Получаем правильный JWT secret из конфигурации Medusa
    const { http } = req.scope.resolve("configModule").projectConfig
    const jwtSecret = http.jwtSecret
    
    const registrationToken = jwt.sign(
      {
        auth_identity_id: authIdentity.id,
        entity_id: identifier,
        actor_type: "customer",
        purpose: "registration"
      },
      jwtSecret,
      { expiresIn: "10m" }
    )

    console.log(`[Test OTP Register] Success for identifier: ${identifier}`)
    
    return res.json({
      registration_token: registrationToken,
      auth_identity: authIdentity
    })
  } catch (error) {
    console.error("[Test OTP Register] Error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
} 