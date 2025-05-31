import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

/**
 * @swagger
 * /auth/customer/otp/authenticate:
 *   post:
 *     operationId: PostAuthCustomerOtpAuthenticate
 *     summary: "Authenticate Customer with OTP"
 *     description: "Authenticates an existing customer using the OTP code sent to their phone number. If successful, establishes a session for the customer."
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
 *                 description: "The customer's phone number."
 *                 example: "+79991234567"
 *               otp:
 *                 type: string
 *                 description: "The OTP code received by the customer."
 *                 example: "123456"
 *     responses:
 *       "200":
 *         description: "Authentication successful."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: "JWT token for authenticated customer session."
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
 *                   example: "Invalid OTP code or no customer found with this phone number."
 */

// Этот файл только для документации Swagger, реальная реализация находится в @perseidesjs/auth-otp
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  res.status(404).json({
    message: "This is a documentation-only endpoint. The actual implementation is provided by @perseidesjs/auth-otp"
  })
} 