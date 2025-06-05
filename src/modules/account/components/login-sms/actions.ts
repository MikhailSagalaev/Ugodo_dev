/**
 * @file: actions.ts
 * @description: Server actions для SMS OTP авторизации (pre-register, generate, register, authenticate, verify)
 * @dependencies: zod, validation.ts
 * @created: 2024-06-11
 * @updated: 2024-06-11
 */

'use server'

import { phoneSchema, otpSchema } from './validation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'

// Тестовый режим - если включен, всегда принимать код 123456
const TEST_MODE = process.env.NEXT_PUBLIC_SMS_TEST_MODE === 'true'
const TEST_OTP = '123456'

type State = {
  success: boolean
  error: string
  phone: string
  flow: string
  token: string
}

const empty: State = { success: false, error: '', phone: '', flow: '', token: '' }

export async function preRegister(_prev: State, formData: FormData): Promise<State> {
  const phone = formData.get('phone') as string
  const validated = phoneSchema.safeParse({ phone })
  if (!validated.success) {
    return { ...empty, error: validated.error.flatten().fieldErrors.phone?.[0] || 'Ошибка валидации', phone }
  }
  try {
    const res = await fetch(`${API_URL}/auth/customer/otp/pre-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: phone })
    })
    if (res.status === 200) {
      return { success: true, error: '', phone, flow: 'register', token: '' }
    }
    if (res.status === 409) {
      return { success: true, error: '', phone, flow: 'login', token: '' }
    }
    const data = await res.json()
    if (data?.message?.includes('Actor already exists')) {
      return { success: true, error: '', phone, flow: 'login', token: '' }
    }
    return { ...empty, error: data.message || 'Ошибка pre-register', phone }
  } catch (e) {
    return { ...empty, error: 'Ошибка сети или сервера', phone }
  }
}

export async function generateOtp(_prev: State, formData: FormData): Promise<State> {
  const phone = formData.get('phone') as string
  const validated = phoneSchema.safeParse({ phone })
  if (!validated.success) {
    return { ...empty, error: validated.error.flatten().fieldErrors.phone?.[0] || 'Ошибка валидации', phone }
  }
  try {
    const res = await fetch(`${API_URL}/auth/customer/otp/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: phone })
    })
    if (res.status === 200) {
      return { success: true, error: '', phone, flow: '', token: '' }
    }
    const data = await res.json()
    return { ...empty, error: data.message || 'Ошибка generateOtp', phone }
  } catch (e) {
    return { ...empty, error: 'Ошибка сети или сервера', phone }
  }
}

export async function verify(_prev: State, formData: FormData): Promise<State> {
  const phone = formData.get('phone') as string
  const otp = formData.get('otp') as string
  
  // В тестовом режиме проверяем тестовый код
  if (TEST_MODE && otp !== TEST_OTP) {
    return { ...empty, error: `В тестовом режиме используйте код ${TEST_OTP}`, phone }
  }

  const validated = otpSchema.safeParse({ phone, otp })
  if (!validated.success) {
    return { ...empty, error: validated.error.flatten().fieldErrors.otp?.[0] || 'Ошибка валидации', phone }
  }
  try {
    const res = await fetch(`${API_URL}/auth/customer/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: phone, otp })
    })
    if (res.status === 200) {
      const data = await res.json()
      return { success: true, error: '', phone, flow: '', token: data.access_token || '' }
    }
    const data = await res.json()
    return { ...empty, error: data.message || 'Ошибка verify', phone }
  } catch (e) {
    return { ...empty, error: 'Ошибка сети или сервера', phone }
  }
}

// Полная регистрация: register → create customer → authenticate
export async function registerComplete(_prev: State, formData: FormData): Promise<State> {
  const phone = formData.get('phone') as string
  const otp = formData.get('otp') as string
  
  // В тестовом режиме проверяем тестовый код
  if (TEST_MODE && otp !== TEST_OTP) {
    return { ...empty, error: `В тестовом режиме используйте код ${TEST_OTP}`, phone }
  }

  const validated = otpSchema.safeParse({ phone, otp })
  if (!validated.success) {
    return { ...empty, error: validated.error.flatten().fieldErrors.otp?.[0] || 'Ошибка валидации', phone }
  }

  try {
    // Шаг 1: Получаем registration_token
    const registerRes = await fetch(`${API_URL}/auth/customer/otp/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: phone, otp })
    })

    if (registerRes.status !== 200) {
      const data = await registerRes.json()
      return { ...empty, error: data.message || 'Ошибка получения токена регистрации', phone }
    }

    const registerData = await registerRes.json()
    const registrationToken = registerData.registration_token

    if (!registrationToken) {
      return { ...empty, error: 'Не получен токен регистрации', phone }
    }

    // Шаг 2: Создаем customer используя registration_token
    const createCustomerRes = await fetch(`${API_URL}/store/customers`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${registrationToken}`
      },
      body: JSON.stringify({ 
        phone: phone,
        first_name: 'Пользователь', // базовые данные, можно потом обновить
        last_name: 'SMS'
      })
    })

    if (createCustomerRes.status !== 201) {
      const data = await createCustomerRes.json()
      return { ...empty, error: data.message || 'Ошибка создания пользователя', phone }
    }

    // Шаг 3: Автоматический вход через authenticate (в течение 60 секунд можно переиспользовать OTP)
    const authRes = await fetch(`${API_URL}/auth/customer/otp/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: phone, otp })
    })

    if (authRes.status === 200) {
      const authData = await authRes.json()
      return { success: true, error: '', phone, flow: '', token: authData.access_token || '' }
    } else {
      // Если authenticate не сработал, просто возвращаем успех создания пользователя
      return { success: true, error: '', phone, flow: '', token: '' }
    }

  } catch (e) {
    return { ...empty, error: 'Ошибка сети или сервера', phone }
  }
}

export async function authenticate(_prev: State, formData: FormData): Promise<State> {
  const phone = formData.get('phone') as string
  const otp = formData.get('otp') as string
  
  // В тестовом режиме проверяем тестовый код  
  if (TEST_MODE && otp !== TEST_OTP) {
    return { ...empty, error: `В тестовом режиме используйте код ${TEST_OTP}`, phone }
  }

  const validated = otpSchema.safeParse({ phone, otp })
  if (!validated.success) {
    return { ...empty, error: validated.error.flatten().fieldErrors.otp?.[0] || 'Ошибка валидации', phone }
  }
  try {
    const res = await fetch(`${API_URL}/auth/customer/otp/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: phone, otp })
    })
    if (res.status === 200) {
      const data = await res.json()
      return { success: true, error: '', phone, flow: '', token: data.access_token || '' }
    }
    const data = await res.json()
    return { ...empty, error: data.message || 'Ошибка authenticate', phone }
  } catch (e) {
    return { ...empty, error: 'Ошибка сети или сервера', phone }
  }
}

// Устаревшая функция register - оставляю для обратной совместимости
export async function register(_prev: State, formData: FormData): Promise<State> {
  const phone = formData.get('phone') as string
  const otp = formData.get('otp') as string
  
  // В тестовом режиме проверяем тестовый код
  if (TEST_MODE && otp !== TEST_OTP) {
    return { ...empty, error: `В тестовом режиме используйте код ${TEST_OTP}`, phone }
  }

  const validated = otpSchema.safeParse({ phone, otp })
  if (!validated.success) {
    return { ...empty, error: validated.error.flatten().fieldErrors.otp?.[0] || 'Ошибка валидации', phone }
  }
  try {
    const res = await fetch(`${API_URL}/auth/customer/otp/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: phone, otp })
    })
    if (res.status === 200) {
      const data = await res.json()
      return { success: true, error: '', phone, flow: '', token: data.registration_token || '' }
    }
    const data = await res.json()
    return { ...empty, error: data.message || 'Ошибка register', phone }
  } catch (e) {
    return { ...empty, error: 'Ошибка сети или сервера', phone }
  }
} 