const SmscApi = require('../../../smsc_api.js'); // Используем require для CommonJS модуля

interface SmscSendParams {
  phones: string;
  mes: string;
  sender?: string; // Если у вас есть зарегистрированный отправитель
  // ... другие параметры API при необходимости
}

interface SmscResponse {
  id?: number;
  cnt?: number;
  error?: string;
  error_code?: number;
}

let apiInstance: any;

// Проверяем тестовый режим из переменных окружения
// Автоматически включается в development режиме, если не задано явно
const TEST_MODE = process.env.SMS_TEST_MODE === 'true' || 
                 (process.env.NODE_ENV === 'development' && process.env.SMS_TEST_MODE !== 'false');
const TEST_OTP = '123456';

function getApiInstance() {
  if (!apiInstance) {
    const SmscApiModule = require('../../../smsc_api.js'); // Загружаем модуль
    apiInstance = SmscApiModule; // Используем экспортированный экземпляр напрямую

    const login = process.env.SMSC_LOGIN;
    const password = process.env.SMSC_PASSWORD;

    if (!login || !password) {
      console.error('SMSC_LOGIN or SMSC_PASSWORD environment variables are not set.');
      throw new Error('SMSC credentials not configured.');
    }

    // Вызываем configure на полученном экземпляре
    apiInstance.configure({
      login: login,
      password: password,
      // ssl: false, // по умолчанию в smsc_api.js
      // charset: 'utf-8' // по умолчанию в smsc_api.js
    });
    console.log('[SmscClient] Configured successfully.'); // Добавим лог для подтверждения конфигурации
  }
  return apiInstance;
}

export async function sendOtpSms(phoneNumber: string, otp: string): Promise<void> {
  // В тестовом режиме просто логируем и возвращаем успех
  if (TEST_MODE) {
    console.log(`[SmscClient] TEST MODE: SMS would be sent to ${phoneNumber} with OTP: ${otp}`);
    console.log(`[SmscClient] TEST MODE: Use OTP ${TEST_OTP} for testing`);
    return Promise.resolve();
  }

  const api = getApiInstance();
  const message = `Ваш код подтверждения: ${otp}`;

  const params: SmscSendParams = {
    phones: phoneNumber,
    mes: message,
    //sender: "Ugodo"
  };

  return new Promise((resolve, reject) => {
    api.send_sms(params, (response: SmscResponse, rawResponse: string, error: string | null, errorCode: number | null) => {
      if (errorCode || error) {
        console.error(`SMSC API Error: Code ${errorCode}, Message: ${error}, Raw: ${rawResponse}`);
        // Попробуем дополнительно проверить response на наличие error полей, как это делает оригинальная библиотека
        const apiError = response?.error;
        const apiErrorCode = response?.error_code;
        if (apiError || apiErrorCode) {
            reject(new Error(`Failed to send SMS: ${apiError} (Code: ${apiErrorCode})`));
        } else {
            reject(new Error(`Failed to send SMS: ${error} (Code: ${errorCode})`));
        }
      } else {
        console.log(`[SmscClient] SMS sent successfully. Response: ${JSON.stringify(response)}`);
        resolve();
      }
    });
  });
}

// Пример использования (можно удалить или закомментировать)
/*
async function testSend() {
  try {
    // Убедитесь, что SMSC_LOGIN и SMSC_PASSWORD установлены в ваших переменных окружения
    // Перед запуском этого теста.
    // 예를 들어, process.env.SMSC_LOGIN = "your_login";
    // process.env.SMSC_PASSWORD = "your_password";
    await sendOtpSms("79991234567", "123456"); // Замените на тестовый номер
    console.log("Test SMS sent.");
  } catch (err) {
    console.error("Test SMS failed:", err);
  }
}

// testSend();
*/ 