import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import jwt from "jsonwebtoken"

/**
 * @swagger
 * /auth/customer/sms/verify:
 *   post:
 *     summary: Верификация кода из SMS
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - request_id
 *               - code
 *             properties:
 *               request_id:
 *                 type: string
 *                 description: Идентификатор запроса
 *               code:
 *                 type: string
 *                 description: Код подтверждения из SMS
 *               create_account:
 *                 type: boolean
 *                 description: Создать аккаунт, если пользователь не найден
 *                 default: false
 *     responses:
 *       200:
 *         description: Код подтверждения верный
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { request_id, code, create_account = false } = req.body

  if (!request_id || !code) {
    return res.status(400).json({
      success: false,
      message: "Необходимо указать request_id и code"
    })
  }

  try {
    // Получаем кеш-сервис
    const cacheManager = req.scope.resolve("cacheService")
    
    // Получаем сохраненные данные по request_id
    const savedData = await cacheManager.get(`sms_code_${request_id}`)
    
    if (!savedData) {
      return res.status(400).json({
        success: false,
        message: "Запрос не найден или истек срок действия кода"
      })
    }
    
    // Проверяем код
    if (savedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: "Неверный код подтверждения"
      })
    }
    
    // Код верный, ищем пользователя по номеру телефона
    const phone = savedData.phone
    const customerService = req.scope.resolve(Modules.CUSTOMER)
    
    let customer = await customerService.retrieveByPhone(phone).catch(() => null)
    
    // Если пользователь не найден и create_account = true, создаем нового пользователя
    if (!customer && create_account) {
      customer = await customerService.create({
        phone,
        email: `${phone.replace(/\+/g, '')}@sms-auth.ugodo.com`,
        // Генерируем случайный пароль (пользователь будет входить через SMS)
        password: Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
        has_account: true
      })
    } else if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Пользователь с таким номером телефона не найден"
      })
    }
    
    // Удаляем код из кеша, чтобы его нельзя было использовать повторно
    await cacheManager.delete(`sms_code_${request_id}`)
    
    // Создаем JWT токен
    const { ConfigModule } = req.scope.resolve(ContainerRegistrationKeys.CONFIG)
    const secret = ConfigModule.projectConfig.jwt_secret
    
    const token = jwt.sign(
      { user_id: customer.id, phone: customer.phone },
      secret,
      { expiresIn: "30d" }
    )
    
    return res.json({
      success: true,
      token,
      user: {
        id: customer.id,
        phone: customer.phone,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      }
    })
  } catch (error) {
    console.error("Ошибка при верификации SMS-кода:", error)
    return res.status(500).json({
      success: false,
      message: "Произошла ошибка при верификации SMS-кода"
    })
  }
}

export const OPTIONS = (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.status(200).send()
} 