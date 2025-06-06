import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const TEST_MODE = process.env.SMS_TEST_MODE === 'true' || 
                 (process.env.NODE_ENV === 'development' && process.env.SMS_TEST_MODE !== 'false')

/**
 * @swagger
 * /auth/customer/otp/generate-test:
 *   post:
 *     tags:
 *       - OTP Auth (Test)
 *     summary: Generate OTP for existing customer (TEST MODE)
 *     description: |
 *       Тестовый метод для генерации OTP существующего клиента.
 *       В тестовом режиме имитирует отправку SMS без реальной отправки.
 *       🚨 ТОЛЬКО ДЛЯ РАЗРАБОТКИ И ТЕСТИРОВАНИЯ! Доступен только когда SMS_TEST_MODE=true.
 *     operationId: postAuthCustomerOtpGenerateTest
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
 *         description: OTP generation simulated (TEST MODE)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: 'OTP generation simulated in test mode'
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

    console.log(`[Test OTP Generate] Simulating OTP generation for: ${identifier}`)
    
    if (!identifier) {
      return res.status(400).json({ error: "Invalid identifier" })
    }

    // Имитируем успешную генерацию OTP
    console.log(`[Test OTP Generate] Simulated OTP generation for identifier: ${identifier}`)
    console.log(`[Test OTP Generate] Use test OTP: 123456`)
    
    return res.json({
      message: "OTP generation simulated in test mode",
      test_mode: true,
      test_otp: "123456",
      identifier: identifier
    })
  } catch (error) {
    console.error("[Test OTP Generate] Error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
} 