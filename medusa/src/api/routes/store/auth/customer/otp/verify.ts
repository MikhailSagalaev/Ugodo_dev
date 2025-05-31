import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

/**
 * @swagger
 * /auth/customer/otp/verify:
 *   post:
 *     operationId: PostAuthCustomerOtpVerify
 *     summary: "Verify OTP Code"
 *     description: "Verifies the OTP code sent to the customer's phone number. This is typically used to verify a phone number without creating a full authentication session."
 *     tags:
 *       - Customer OTP Auth
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
 *                 description: "The phone number that received the OTP."
 *                 example: "+79991234567"
 *               otp:
 *                 type: string
 *                 description: "The OTP code received by the customer."
 *                 example: "123456"
 *     responses:
 *       "200":
 *         description: "OTP verification successful."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: "True if the OTP was verified successfully."
 *                   example: true
 *       "400":
 *         description: "Bad Request. Missing phone number or OTP code."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Phone number and OTP code are required."
 *       "401":
 *         description: "Unauthorized. Invalid or expired OTP code."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid OTP code."
 */

// Этот файл только для документации Swagger, реальная реализация находится в @perseidesjs/auth-otp
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  res.status(404).json({
    message: "This is a documentation-only endpoint. The actual implementation is provided by @perseidesjs/auth-otp"
  })
} 