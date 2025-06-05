// Тестовый API для разработки SMS функциональности
// Используется когда основной backend недоступен

const TEST_OTP = '123456'
const TEST_MODE = true // Всегда тестовый режим для мока

interface ApiResponse {
  success: boolean
  data?: any
  message?: string
  access_token?: string
  token?: string
  registration_token?: string
}

// Имитация задержки сети
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class TestSmsApi {
  private baseUrl = 'http://localhost:9000'
  
  constructor() {
    console.log('[TestSmsApi] Initialized in test mode')
  }

  async preRegister(identifier: string): Promise<ApiResponse> {
    await delay(1000) // Имитируем задержку API
    
    // Проверяем, "существует" ли пользователь (для тестирования)
    const existingUsers = ['1111111111', '+71111111111'] // Тестовые существующие пользователи
    const normalizedPhone = identifier.replace(/\D/g, '')
    
    if (existingUsers.some(user => user.includes(normalizedPhone.slice(-10)))) {
      return {
        success: false,
        message: 'Actor already exists'
      }
    }
    
    console.log(`[TestSmsApi] Pre-register: SMS would be sent to ${identifier}`)
    return {
      success: true,
      message: 'OTP generated and sent'
    }
  }

  async generate(identifier: string): Promise<ApiResponse> {
    await delay(1000)
    console.log(`[TestSmsApi] Generate: SMS would be sent to ${identifier}`)
    return {
      success: true,
      message: 'OTP generated and sent'
    }
  }

  async register(identifier: string, otp: string): Promise<ApiResponse> {
    await delay(1500)
    
    if (otp !== TEST_OTP) {
      return {
        success: false,
        message: `В тестовом режиме используйте код ${TEST_OTP}`
      }
    }
    
    console.log(`[TestSmsApi] Register: User registered with ${identifier}`)
    return {
      success: true,
      registration_token: 'test_registration_token_' + Date.now(),
      message: 'Registration token generated'
    }
  }

  async createCustomer(registrationToken: string, phone: string): Promise<ApiResponse> {
    await delay(1000)
    
    if (!registrationToken.startsWith('test_registration_token_')) {
      return {
        success: false,
        message: 'Invalid registration token'
      }
    }
    
    console.log(`[TestSmsApi] CreateCustomer: Customer created with phone ${phone}`)
    return {
      success: true,
      data: {
        id: 'cust_test_' + Date.now(),
        phone: phone
      },
      message: 'Customer created successfully'
    }
  }

  async authenticate(identifier: string, otp: string): Promise<ApiResponse> {
    await delay(1000)
    
    if (otp !== TEST_OTP) {
      return {
        success: false,
        message: `В тестовом режиме используйте код ${TEST_OTP}`
      }
    }
    
    console.log(`[TestSmsApi] Authenticate: User authenticated with ${identifier}`)
    return {
      success: true,
      // Согласно документации @perseidesjs/auth-otp возвращается 'token'
      token: 'test_auth_token_' + Date.now(),
      message: 'Authentication successful'
    }
  }

  async verify(identifier: string, otp: string): Promise<ApiResponse> {
    await delay(1000)
    
    if (otp !== TEST_OTP) {
      return {
        success: false,
        message: `В тестовом режиме используйте код ${TEST_OTP}`
      }
    }
    
    console.log(`[TestSmsApi] Verify: User verified with ${identifier}`)
    return {
      success: true,
      // Согласно документации @perseidesjs/auth-otp возвращается 'token'  
      token: 'test_auth_token_' + Date.now(),
      message: 'Verification successful'
    }
  }
}

// Создаем глобальный экземпляр
export const testSmsApi = new TestSmsApi() 