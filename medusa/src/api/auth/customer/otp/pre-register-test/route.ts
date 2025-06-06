import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const TEST_MODE = process.env.SMS_TEST_MODE === 'true' || 
                 (process.env.NODE_ENV === 'development' && process.env.SMS_TEST_MODE !== 'false')

/**
 * @swagger
 * /auth/customer/otp/pre-register-test:
 *   post:
 *     tags:
 *       - OTP Auth (Test)
 *     summary: Pre-register process for new customer (TEST MODE)
 *     description: |
 *       Тестовый метод для предварительной регистрации нового клиента.
 *       В тестовом режиме имитирует отправку SMS без реальной отправки.
 *       🚨 ТОЛЬКО ДЛЯ РАЗРАБОТКИ И ТЕСТИРОВАНИЯ! Доступен только когда SMS_TEST_MODE=true.
 *     operationId: postAuthCustomerOtpPreRegisterTest
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Customer's phone number
 *                 example: '+79991234567'
 *     responses:
 *       '200':
 *         description: Pre-registration OTP simulated (TEST MODE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: 'Pre-registration OTP simulated in test mode'
 *                 test_mode:
 *                   type: boolean
 *                   description: Indicates test mode is active
 *                   example: true
 *                 test_otp:
 *                   type: string
 *                   description: The test OTP code to use
 *                   example: '123456'
 *       '400':
 *         description: Invalid identifier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Invalid identifier'
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
    const { identifier } = req.body as { identifier: string }

    console.log(`[Test OTP Pre-Register] Simulating pre-registration for: ${identifier}`)
    
    if (!identifier) {
      return res.status(400).json({ error: "Invalid identifier" })
    }

    // Имитируем успешную предварительную регистрацию
    console.log(`[Test OTP Pre-Register] Simulated pre-registration for identifier: ${identifier}`)
    console.log(`[Test OTP Pre-Register] Use test OTP: 123456`)
    
    return res.json({
      message: "Pre-registration OTP simulated in test mode",
      test_mode: true,
      test_otp: "123456",
      identifier: identifier
    })
  } catch (error) {
    console.error("[Test OTP Pre-Register] Error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
} 