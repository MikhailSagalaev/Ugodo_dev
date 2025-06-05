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
      return { success: true, error: '', phone, flow: '', token: data.token || '' }
    }
    const data = await res.json()
    return { ...empty, error: data.message || 'Ошибка verify', phone }
  } catch (e) {
    return { ...empty, error: 'Ошибка сети или сервера', phone }
  }
}

export async function register(_prev: State, formData: FormData): Promise<State> {
  const phone = formData.get('phone') as string
  const otp = formData.get('otp') as string
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
      return { success: true, error: '', phone, flow: '', token: data.token || '' }
    }
    const data = await res.json()
    return { ...empty, error: data.message || 'Ошибка register', phone }
  } catch (e) {
    return { ...empty, error: 'Ошибка сети или сервера', phone }
  }
}

export async function authenticate(_prev: State, formData: FormData): Promise<State> {
  const phone = formData.get('phone') as string
  const otp = formData.get('otp') as string
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