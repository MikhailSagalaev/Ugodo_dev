import SmscApi from './smsc_api.js'; // Используем .js, т.к. оригинальный файл - JS
import { Logger } from '@medusajs/medusa';

interface SmscClientOptions {
  login?: string;
  password?: string; // Может быть паролем или API ключом
  logger: Logger;
}

interface SmscSendSmsData {
  phones: string | string[]; // Номер телефона или массив номеров
  mes: string; // Текст сообщения
  sender?: string; // Имя отправителя (если разрешено и настроено в SMSC)
  // Можно добавить другие параметры из API SMSC по необходимости
  // translit?: number; (1 - транслитерировать, 2 - в латиницу)
  // time?: string; (время отправки UTC)
  // id?: number; (уникальный ID сообщения для отслеживания)
  // ... и другие
}

// Типизация ответа от smsc_api (может потребовать уточнения на основе реальных ответов)
interface SmscResponse {
  id?: number;
  cnt?: number;
  cost?: string;
  balance?: string;
  error?: string;
  error_code?: number;
  [key: string]: any; // Для других возможных полей
}

class SmscClient {
  private api;
  private logger: Logger;
  private configured: boolean = false;

  constructor(options: SmscClientOptions) {
    this.logger = options.logger;
    this.api = SmscApi; // Экземпляр уже создан в smsc_api.js

    const login = options.login || process.env.SMSC_LOGIN;
    const password = options.password || process.env.SMSC_PASSWORD;

    if (!password) { // Пароль/API ключ обязателен
      this.logger.error('[SmscClient] SMSC Password/API Key is required. Check SMSC_PASSWORD env variable.');
      return;
    }

    this.api.configure({
      login: login || '', // Если login пустой, password используется как API ключ
      password: password,
      // ssl: true, // Можно включить SSL, если необходимо
    });
    this.configured = true;
    this.logger.info('[SmscClient] Configured successfully.');
  }

  public async sendSms(data: SmscSendSmsData): Promise<SmscResponse> {
    if (!this.configured) {
      const errorMsg = '[SmscClient] Client not configured. SMS not sent.';
      this.logger.error(errorMsg);
      return Promise.reject({ error: errorMsg, error_code: -1 });
    }

    return new Promise((resolve, reject) => {
      this.api.send_sms(data, (response: SmscResponse, rawResponse: string, error: string, errorCode: number) => {
        if (errorCode && errorCode !== 0) {
          this.logger.error(`[SmscClient] Error sending SMS. Code: ${errorCode}, Message: ${error}. Raw: ${rawResponse}`);
          reject({ error, error_code: errorCode, rawResponse });
        } else {
          this.logger.info(`[SmscClient] SMS sent successfully. Response: ${rawResponse}`);
          resolve(response);
        }
      });
    });
  }

  // Можно добавить другие промисифицированные методы из smsc_api.js по необходимости, например, get_balance
  public async getBalance(): Promise<SmscResponse> {
    if (!this.configured) {
      const errorMsg = '[SmscClient] Client not configured.';
      this.logger.error(errorMsg);
      return Promise.reject({ error: errorMsg, error_code: -1 });
    }

    return new Promise((resolve, reject) => {
      this.api.get_balance((balanceData: any, rawResponse: string, error: string, errorCode: number) => {
        if (errorCode && errorCode !== 0) {
          this.logger.error(`[SmscClient] Error fetching balance. Code: ${errorCode}, Message: ${error}`);
          reject({ error, error_code: errorCode, rawResponse });
        } else {
          // В smsc_api.js get_balance передает первым аргументом сам баланс или 0 в случае ошибки
          // response здесь будет числом (баланс) или объектом с ошибкой
          // Мы ожидаем SmscResponse, поэтому формируем его соответствующим образом
          if (typeof balanceData === 'number') {
             resolve({ balance: balanceData.toString() } as SmscResponse);
          } else {
             resolve(balanceData as SmscResponse); // если это уже объект ошибки
          }
        }
      });
    });
  }
}

export default SmscClient; 