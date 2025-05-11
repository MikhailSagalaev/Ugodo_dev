import { Router } from "express"
import cors from "cors"
import { ConfigModule } from "@medusajs/framework/types"
import VerificationCodeService from '../../../services/verification-code'


const storeRoutes = Router()

export default (app, rootDirectory) => {
  app.use("/store", storeRoutes)
  
  const { projectConfig } = app.getConfigModule() as ConfigModule
  const corsOptions = {
    origin: projectConfig.http.storeCors.split(","),
    credentials: true,
  }
  
  // Применяем CORS для маршрутов магазина
  storeRoutes.use(cors(corsOptions))
  
  storeRoutes.post('/auth/sms/request', async (req, res) => {
    const { phone } = req.body
    if (!phone) return res.status(400).json({ error: 'Phone required' })
    try {
      const verificationCodeService = new VerificationCodeService({
        configModule: (req as any).getConfigModule(),
        cacheService: (req as any).scope.resolve('cacheService'),
      })
      await verificationCodeService.generateCode(phone)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message || 'Ошибка отправки SMS' })
    }
  })

  storeRoutes.post('/auth/sms/verify', async (req, res) => {
    const { phone, code } = req.body
    if (!phone || !code) return res.status(400).json({ error: 'Phone and code required' })
    try {
      const verificationCodeService = new VerificationCodeService({
        configModule: (req as any).getConfigModule(),
        cacheService: (req as any).scope.resolve('cacheService'),
      })
      const isValid = await verificationCodeService.verifyCode(phone, code)
      if (!isValid) return res.status(401).json({ error: 'Неверный код' })
      // Поиск или создание Customer
      const customerService = (req as any).scope.resolve('customerService')
      let customer = await customerService.list({ phone }, { take: 1 })
      if (customer.length > 0) {
        customer = customer[0]
      } else {
        customer = await customerService.create({ phone })
      }
      // Устанавливаем customer_id в httpOnly cookie для авторизации в Store API
      res.cookie('customer_id', customer.id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
      res.json({ success: true, customer })
    } catch (e) {
      res.status(500).json({ error: e.message || 'Ошибка проверки кода' })
    }
  })
  
  return storeRoutes
} 