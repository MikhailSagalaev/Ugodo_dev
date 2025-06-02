/**
 * @file: page.tsx
 * @description: Чистый SMS-авторизация/регистрация по PerseidesJS (строго по документации)
 * @dependencies: @medusajs/ui, fetch, Tailwind, zod
 * @created: 2024-07-31
 */

'use client'

import { useState } from 'react'
import { Button } from '@medusajs/ui'
import { z } from 'zod'

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'

const phoneSchema = z.string().min(10, 'Введите корректный номер телефона').max(20)
const otpSchema = z.string().min(4, 'Код должен содержать минимум 4 цифры').max(8)

function getAutoEmail(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `phone${digits}@ugodo.local`
}

export default function SmsAuthPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [flow, setFlow] = useState<'register' | 'login' | null>(null)
  const [registrationToken, setRegistrationToken] = useState('')

  // 1. Ввод телефона: определяем flow
  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    console.log('[handlePhone] submit', { phone })
    const phoneValid = phoneSchema.safeParse(phone)
    if (!phoneValid.success) {
      setError('Введите корректный номер телефона.')
      setLoading(false)
      console.log('[handlePhone] invalid phone', phone)
      return
    }
    try {
      console.log('[handlePhone] fetch pre-register', phone)
      const res = await fetch(`${API_URL}/auth/customer/otp/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone })
      })
      const data = await res.json().catch(() => ({}))
      console.log('[handlePhone] pre-register response', { status: res.status, data })
      if (data?.message && data.message.includes('Actor already exists')) {
        setFlow('login')
        console.log('[handlePhone] Actor exists, switch to login flow')
        // отправляем OTP для логина
        console.log('[handlePhone] fetch generate', phone)
        const genRes = await fetch(`${API_URL}/auth/customer/otp/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: phone })
        })
        const genData = await genRes.json().catch(() => ({}))
        console.log('[handlePhone] generate response', { status: genRes.status, genData })
        if (genRes.ok) {
          setStep('otp')
          setMessage('Код отправлен на ваш номер. Введите его для входа.')
          console.log('[handlePhone] step set to otp, login flow')
        } else {
          setError(genData.message || 'Ошибка отправки кода (логин)')
          console.log('[handlePhone] error in generate', genData)
        }
      } else if (res.ok) {
        setFlow('register')
        setStep('otp')
        setMessage('Код отправлен на ваш номер. Введите его для завершения регистрации.')
        console.log('[handlePhone] step set to otp, register flow')
      } else {
        setError(data.message || 'Ошибка отправки кода')
        console.log('[handlePhone] error in pre-register', data)
      }
    } catch (e) {
      setError('Ошибка сети или сервера')
      console.error('[handlePhone] network/server error', e)
    } finally {
      setLoading(false)
      console.log('[handlePhone] loading set to false')
    }
  }

  // 2. Ввод OTP: регистрация или логин
  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const otpValid = otpSchema.safeParse(otp)
    if (!otpValid.success) {
      setError('Введите корректный код из SMS.')
      setLoading(false)
      return
    }
    try {
      if (flow === 'register') {
        // 2.1. Регистрация: /register -> /store/customers -> (опц.) /authenticate
        const res = await fetch(`${API_URL}/auth/customer/otp/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: phone, otp })
        })
        const data = await res.json().catch(() => ({}))
        console.log('register response:', res.status, data)
        if (!res.ok || !data.token) {
          setError(data.message || 'Ошибка регистрации: неверный код или истёк срок действия.')
          setLoading(false)
          return
        }
        setRegistrationToken(data.token)
        // создаём пользователя
        const email = getAutoEmail(phone)
        const customerRes = await fetch(`${API_URL}/store/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.token}`,
            ...(PUBLISHABLE_KEY ? { 'x-publishable-api-key': PUBLISHABLE_KEY } : {})
          },
          body: JSON.stringify({ phone, email })
        })
        const customerData = await customerRes.json().catch(() => ({}))
        console.log('customer create response:', customerRes.status, customerData)
        if (!customerRes.ok || !customerData.customer) {
          setError(customerData.message || 'Ошибка создания пользователя')
          setLoading(false)
          return
        }
        // (опционально) сразу аутентифицируем
        const authRes = await fetch(`${API_URL}/auth/customer/otp/authenticate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: phone, otp })
        })
        const authData = await authRes.json().catch(() => ({}))
        console.log('authenticate response:', authRes.status, authData)
        if (!authRes.ok || !authData.token) {
          setError(authData.message || 'Ошибка входа после регистрации')
          setLoading(false)
          return
        }
        // сохраняем токен (через серверный API)
        await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: authData.token })
        })
        setMessage('Регистрация и вход завершены!')
        window.location.href = '/account'
      } else if (flow === 'login') {
        // 2.2. Логин: /verify
        const res = await fetch(`${API_URL}/auth/customer/otp/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: phone, otp })
        })
        const data = await res.json().catch(() => ({}))
        console.log('verify response:', res.status, data)
        if (!res.ok || !data.token) {
          setError(data.message || 'Ошибка входа: неверный код или истёк срок действия.')
          setLoading(false)
          return
        }
        await fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: data.token })
        })
        setMessage('Вход выполнен!')
        window.location.href = '/account'
      } else {
        setError('Неизвестный сценарий. Попробуйте ещё раз.')
      }
    } catch (e) {
      setError('Ошибка сети или сервера')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-2">Вход или регистрация по SMS</h2>
        {step === 'phone' && (
          <form onSubmit={handlePhone} className="flex flex-col gap-4">
            <label htmlFor="phone" className="text-sm font-medium">Телефон</label>
            <input
              id="phone"
              type="text"
              name="phone"
              placeholder="+7 999 123-45-67"
              className="px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:outline-none transition w-full text-base"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              aria-label="Телефон"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-center mt-2" role="alert">{error}</div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-center font-semibold" role="status">{message}</div>
            )}
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>{loading ? 'Загрузка...' : 'Получить код'}</Button>
          </form>
        )}
        {step === 'otp' && (
          <form onSubmit={handleOtp} className="flex flex-col gap-4">
            <label htmlFor="otp" className="text-sm font-medium">Код из SMS</label>
            <input
              id="otp"
              type="text"
              name="otp"
              placeholder="Введите код"
              className="px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:outline-none transition w-full text-base"
              required
              value={otp}
              onChange={e => setOtp(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Код из SMS"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-center mt-2" role="alert">{error}</div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-center font-semibold" role="status">{message}</div>
            )}
            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>{loading ? 'Загрузка...' : (flow === 'register' ? 'Завершить регистрацию' : 'Войти')}</Button>
          </form>
        )}
      </div>
    </div>
  )
} 