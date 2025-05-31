/**
 * @file: pre-register.ts
 * @description: Кастомный endpoint для генерации OTP для входа/регистрации по SMS. Всегда генерирует OTP, даже если пользователь уже существует.
 * @dependencies: SmsOtpAuthService, AuthIdentityProviderService
 * @created: 2025-06-01
 */
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { container } from "@medusajs/framework"
import SmsOtpAuthService from "../../../../../../modules/auth-phone-otp/service"

/**
 * @swagger
 * /auth/customer/otp/pre-register:
 *   post:
 *     operationId: PostAuthCustomerOtpPreRegister
 *     summary: "Request OTP for Customer SMS Authentication"
 *     description: "Requests an OTP (One-Time Password) to be sent to the provided phone number for customer authentication. Это кастомная реализация: OTP всегда генерируется, даже если пользователь уже существует."
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
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: "The customer's phone number to send the OTP to."
 *                 example: "+79991234567"
 *     responses:
 *       "200":
 *         description: "OTP request acknowledged. Success indicates the system attempted to send OTP."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: "True if the OTP was successfully sent."
 *                   example: true
 *       "400":
 *         description: "Bad Request. Missing or invalid phone number."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  error:
 *                    type: string
 *                    example: "Phone number is required."
 *       "500":
 *         description: "Internal Server Error (e.g., failed to contact SMS gateway)."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                  success:
 *                    type: boolean
 *                    example: false
 *                  error:
 *                    type: string
 *                    example: "Failed to send OTP. Please try again later."
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const identifier = req.body?.identifier as string
  if (!identifier) {
    return res.status(400).json({ success: false, error: "Phone number is required." })
  }
  const smsOtpAuthService = container.resolve<SmsOtpAuthService>("smsOtpAuthService")
  const authIdentityProviderService = container.resolve("authIdentityProviderService")
  const result = await smsOtpAuthService.register({ body: { phone_number: identifier } }, authIdentityProviderService as AuthIdentityProviderService)
  if (result.success) {
    return res.status(200).json({ success: true })
  } else {
    return res.status(500).json({ success: false, error: result.error || "Failed to send OTP. Please try again later." })
  }
} 