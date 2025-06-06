import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

const TEST_MODE = process.env.SMS_TEST_MODE === 'true' || 
                 (process.env.NODE_ENV === 'development' && process.env.SMS_TEST_MODE !== 'false')
const TEST_OTP = '123456'

/**
 * @swagger
 * /auth/customer/otp/verify-test:
 *   post:
 *     tags:
 *       - OTP Auth (Test)
 *     summary: Verify OTP for existing customer (TEST MODE)
 *     description: |
 *       Тестовый метод для верификации OTP существующего клиента.
 *       В тестовом режиме принимается фиксированный OTP код '123456' для тестирования интерфейса.
 *       🚨 ТОЛЬКО ДЛЯ РАЗРАБОТКИ И ТЕСТИРОВАНИЯ! Доступен только когда SMS_TEST_MODE=true.
 *     operationId: postAuthCustomerOtpVerifyTest
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - otp
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Customer's phone number
 *                 example: '+79991234567'
 *               otp:
 *                 type: string
 *                 description: Test OTP code (must be '123456' in test mode)
 *                 example: '123456'
 *     responses:
 *       '200':
 *         description: OTP verified successfully (TEST MODE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                   example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *                 auth_identity:
 *                   type: object
 *                   description: Auth identity details
 *       '400':
 *         description: Invalid OTP or identifier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid OTP'
 *       '404':
 *         description: Test endpoint not available in production
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Test endpoint not available in production'
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<MedusaResponse> {
  if (!TEST_MODE) {
    return res.status(404).json({ error: "Test endpoint not available in production" })
  }

  try {
    const { identifier, otp } = req.body as { identifier: string; otp: string }

    console.log(`[Test OTP Verify] Received: identifier=${identifier}, otp=${otp}`)
    
    if (otp !== TEST_OTP) {
      console.log(`[Test OTP Verify] Invalid test OTP provided: ${otp}, expected: ${TEST_OTP}`)
      return res.status(400).json({ error: "Invalid OTP" })
    }

    // В тестовом режиме используем оригинальный плагин для получения правильного токена
    const authModuleService = req.scope.resolve(Modules.AUTH)
    
    // Находим auth identity и генерируем токен вручную
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
      
      // Используем правильные настройки для JWT из Medusa
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
      
      console.log(`[Test OTP Verify] Generated token for customer_id: ${customerId}`)
      console.log(`[Test OTP Verify] Auth identity app_metadata:`, authIdentity.app_metadata)

      console.log(`[Test OTP Verify] Manual token generated for identifier: ${identifier}`)
      
      return res.json({
        token,
        auth_identity: authIdentity
      })
  } catch (error) {
    console.error("[Test OTP Verify] Error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
} 