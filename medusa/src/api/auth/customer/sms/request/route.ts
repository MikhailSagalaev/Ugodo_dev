import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import SmscService from "../../../../../../services/smsc"

/**
 * @swagger
 * /auth/customer/sms/request:
 *   post:
 *     summary: Запросить код подтверждения по SMS
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Номер телефона в международном формате
 *                 example: "+79991234567"
 *     responses:
 *       200:
 *         description: SMS успешно отправлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 request_id:
 *                   type: string
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { phone } = req.body

  // Базовая валидация номера телефона
  if (!phone || !/^\+[0-9]{10,15}$/.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Неверный формат номера телефона. Используйте международный формат, например: +79991234567"
    })
  }
  
  try {
    // Генерируем код подтверждения (6 цифр)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Получаем сервис для работы с SMS
    const smscService = req.scope.resolve("smscService") as SmscService
    
    // Генерируем уникальный ID запроса
    const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2)
    
    // Сохраняем код в кэше или базе данных
    const cacheService = req.scope.resolve("cacheService")
    await cacheService.set(`sms_code_${requestId}`, {
      phone,
      code: verificationCode,
      createdAt: new Date()
    }, 600) // TTL 10 минут
    
    // Отправляем SMS через SMSC
    const smsText = `Ваш код подтверждения для Ugodo: ${verificationCode}`
    await smscService.sendSms(phone, smsText)
    
    return res.json({
      success: true,
      request_id: requestId
    })
  } catch (error) {
    console.error("Ошибка при отправке SMS:", error)
    return res.status(500).json({
      success: false,
      message: "Произошла ошибка при отправке SMS"
    })
  }
}

export const OPTIONS = (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.status(200).send()
} 