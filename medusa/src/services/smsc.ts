import { ConfigModule } from "@medusajs/framework/types"
import axios from "axios"

/**
 * Сервис для отправки SMS через SMSC API
 */
export default class SmscService {
  protected readonly config: ConfigModule
  protected readonly options: {
    login: string
    password: string
    apiUrl: string
    sender?: string
  }

  constructor({ configModule }) {
    this.config = configModule
    const smscConfig = this.config.projectConfig.smsc || {}

    this.options = {
      login: smscConfig.login || process.env.SMSC_LOGIN,
      password: smscConfig.password || process.env.SMSC_PASSWORD,
      apiUrl: smscConfig.apiUrl || "https://smsc.ru/sys/send.php",
      sender: smscConfig.sender || process.env.SMSC_SENDER || "Ugodo"
    }

    if (!this.options.login || !this.options.password) {
      console.warn("SMSC: Не указаны логин или пароль для SMSC API")
    }
  }

  /**
   * Отправка SMS сообщения через SMSC
   * @param phone Номер телефона в международном формате
   * @param message Текст сообщения
   * @returns Результат отправки
   */
  async sendSms(phone: string, message: string): Promise<any> {
    try {
      if (!this.options.login || !this.options.password) {
        console.warn("SMSC: Не указаны логин или пароль для SMSC API")
        // В режиме разработки имитируем успешную отправку
        if (process.env.NODE_ENV !== 'production') {
          console.log(`[Имитация SMS] На номер ${phone} отправлено: ${message}`)
          return { success: true, id: "dev-" + Date.now() }
        }
        throw new Error("Не указаны учетные данные SMSC")
      }

      // Убираем плюс для SMSC API
      const formattedPhone = phone.startsWith('+') ? phone.substring(1) : phone

      // Формируем параметры запроса
      const params = new URLSearchParams({
        login: this.options.login,
        psw: this.options.password,
        phones: formattedPhone,
        mes: message,
        sender: this.options.sender,
        fmt: '3',  // Формат ответа: JSON
        charset: 'utf-8'
      })

      // Отправляем запрос к SMSC API
      const response = await axios.post(this.options.apiUrl, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      // Проверяем ответ
      const data = response.data
      
      if (data.error) {
        throw new Error(`SMSC API ошибка: ${data.error} (код ${data.error_code})`)
      }

      return {
        success: true,
        id: data.id,
        count: data.cnt,
        cost: data.cost
      }
    } catch (error) {
      console.error("Ошибка при отправке SMS через SMSC:", error)
      throw error
    }
  }
} 