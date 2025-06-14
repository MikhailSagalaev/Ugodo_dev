import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const TEST_MODE = process.env.SMS_TEST_MODE === 'true' || 
                 (process.env.NODE_ENV === 'development' && process.env.SMS_TEST_MODE !== 'false')
const TEST_OTP = '123456'

/**
 * @swagger
 * /auth/customer/otp/register-test:
 *   post:
 *     tags:
 *       - OTP Auth (Test)
 *     summary: Register new customer with OTP (TEST MODE)
 *     description: |
 *       Тестовый метод для регистрации нового клиента с OTP.
 *       В тестовом режиме принимается фиксированный OTP код '123456' для тестирования интерфейса.
 *       🚨 ТОЛЬКО ДЛЯ РАЗРАБОТКИ И ТЕСТИРОВАНИЯ! Доступен только когда SMS_TEST_MODE=true.
 *     operationId: postAuthCustomerOtpRegisterTest
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
 *         description: Registration token issued (TEST MODE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 registration_token:
 *                   type: string
 *                   description: Registration token for creating customer
 *                   example: 'test-registration-token-abc123'
 *                 test_mode:
 *                   type: boolean
 *                   description: Indicates test mode is active
 *                   example: true
 *       '400':
 *         description: Invalid OTP
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

    console.log(`[Test OTP Register] Received: identifier=${identifier}, otp=${otp}`)
    
    if (otp !== TEST_OTP) {
      console.log(`[Test OTP Register] Invalid test OTP provided: ${otp}, expected: ${TEST_OTP}`)
      return res.status(400).json({ error: "Invalid OTP" })
    }

    // Генерируем фиктивный registration_token для тестирования
    const testRegistrationToken = `test-reg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    console.log(`[Test OTP Register] Generated test registration token: ${testRegistrationToken}`)
    
    return res.json({
      registration_token: testRegistrationToken,
      test_mode: true
    })
  } catch (error) {
    console.error("[Test OTP Register] Error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}