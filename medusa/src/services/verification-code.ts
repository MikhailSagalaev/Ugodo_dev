import { ConfigModule } from "@medusajs/framework/types"
import { generateRandomCode } from "../utils/generate-code"
import CacheService from "./cache"
import smsc from '../../../smsc_api.js'

/**
 * Сервис для работы с кодами подтверждения
 */
export default class VerificationCodeService {
  protected readonly config: ConfigModule
  protected readonly cacheService: CacheService
  protected readonly codeLength: number
  protected readonly codeTTL: number // в секундах

  constructor({ configModule, cacheService }) {
    this.config = configModule
    this.cacheService = cacheService
    
    // Получаем конфигурацию из .env или используем значения по умолчанию
    this.codeLength = process.env.VERIFICATION_CODE_LENGTH ? 
      parseInt(process.env.VERIFICATION_CODE_LENGTH) : 6
    this.codeTTL = process.env.VERIFICATION_CODE_TTL ? 
      parseInt(process.env.VERIFICATION_CODE_TTL) : 300 // 5 минут по умолчанию
  }

  /**
   * Генерирует новый код подтверждения для указанного идентификатора
   * @param identifier Идентификатор (обычно email или телефон)
   * @returns Сгенерированный код
   * @throws Ошибка, если не удалось отправить SMS (для телефонов)
   *
   * Если identifier — телефон, отправляет SMS через smsc.ru
   */
  async generateCode(identifier: string): Promise<string> {
    // Генерируем код заданной длины
    const code = generateRandomCode(this.codeLength)
    
    // Сохраняем код в кэше с заданным временем жизни
    await this.cacheService.set(`verification_code:${identifier}`, code, this.codeTTL)
    
    // Если это телефон, отправляем SMS
    if (/^\+?\d{10,15}$/.test(identifier)) {
      await new Promise((resolve, reject) => {
        smsc.send_sms({ phones: identifier, mes: `Ваш код: ${code}` }, (data, raw, err, code) => {
          if (err) reject(new Error('Ошибка отправки SMS: ' + err))
          else resolve(data)
        })
      })
    }
    
    return code
  }

  /**
   * Проверяет код подтверждения
   * @param identifier Идентификатор (обычно email или телефон)
   * @param code Код для проверки
   * @returns true, если код верный, иначе false
   */
  async verifyCode(identifier: string, code: string): Promise<boolean> {
    const storedCode = await this.cacheService.get(`verification_code:${identifier}`)
    
    // Если кода нет или он не совпадает
    if (!storedCode || storedCode !== code) {
      return false
    }
    
    // Если код верный, удаляем его из кэша, чтобы его нельзя было использовать повторно
    await this.cacheService.delete(`verification_code:${identifier}`)
    
    return true
  }
}

module.exports = VerificationCodeService 