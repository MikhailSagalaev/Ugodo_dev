import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

/**
 * @swagger
 * /auth/customer/otp/register:
 *   post:
 *     operationId: PostAuthCustomerOtpRegister
 *     summary: "Register Customer with OTP"
 *     description: "Creates a new customer account after successful OTP verification. This endpoint should be called after verifying the OTP code."
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
 *         description: "Registration token obtained successfully."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: "JWT token to use for customer account creation."
 *       "400":
 *         description: "Bad Request. Missing required fields or invalid OTP."
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
 *                   example: "Missing required fields for registration."
 *       "409":
 *         description: "Conflict. Customer with this phone number or email already exists."
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
 *                   example: "Customer with this phone number already exists."
 */

// Этот файл только для документации Swagger, реальная реализация находится в @perseidesjs/auth-otp
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  res.status(404).json({
    message: "This is a documentation-only endpoint. The actual implementation is provided by @perseidesjs/auth-otp"
  })
} 