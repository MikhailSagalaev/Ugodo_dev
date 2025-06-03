/**
 * @file: page.tsx
 * @description: Страница авторизации и регистрации с независимыми флоу (SMS и email/пароль) и кастомным переключением
 * @dependencies: @medusajs/ui, fetch, Tailwind, zod
 * @created: 2024-07-31
 * @updated: 2024-08-01
 */

'use client'

import { useState } from 'react'
import { Button, Input, Heading, Text, Label } from '@medusajs/ui'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'

const phoneSchema = z.string().min(10, 'Введите корректный номер телефона').max(20)
const otpSchema = z.string().min(6, 'Код должен содержать минимум 6 цифр').max(8)
const emailSchema = z.string().email('Введите корректный email')
const passwordSchema = z.string().min(6, 'Минимум 6 символов')

function getAutoEmail(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `phone${digits}@ugodo.local`
}

function PhoneInput({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled?: boolean }) {
  return (
    <Input
      type="tel"
      placeholder="+7 999 123-45-67"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      autoFocus
      autoComplete="tel"
      className="w-full"
    />
  )
}

function OtpInput({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled?: boolean }) {
  return (
    <Input
      type="text"
      placeholder="Код из SMS"
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      autoFocus
      autoComplete="one-time-code"
      className="w-full"
      maxLength={8}
    />
  )
}

function LoginSms() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 1. Ввод телефона — generate OTP
  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const phoneValid = phoneSchema.safeParse(phone)
    if (!phoneValid.success) {
      setError('Введите корректный номер телефона.')
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_URL}/auth/customer/otp/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone })
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 404 || (data?.message && data.message.includes('not found'))) {
        setError('Пользователь не найден. Зарегистрируйтесь.')
        setLoading(false)
        return
      }
      if (res.ok) {
        setStep('otp')
        setMessage('Код отправлен на ваш номер. Введите его для входа.')
      } else {
        setError(data.message || 'Ошибка отправки кода')
      }
    } catch (e) {
      setError('Ошибка сети или сервера')
    } finally {
      setLoading(false)
    }
  }

  // 2. Ввод OTP — verify
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
      const res = await fetch(`${API_URL}/auth/customer/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, otp })
      })
      const data = await res.json().catch(() => ({}))
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
      router.replace('/account')
    } catch (e) {
      setError('Ошибка сети или сервера')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading level="h2" className="text-2xl">Вход по SMS</Heading>
      {step === 'phone' && (
        <form onSubmit={handlePhone} className="flex flex-col gap-4">
          <PhoneInput value={phone} onChange={setPhone} disabled={loading} />
          <Button type="submit" isLoading={loading} className="w-full" variant="primary">Получить код</Button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={handleOtp} className="flex flex-col gap-4">
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <Button type="submit" isLoading={loading} className="w-full" variant="primary">Войти</Button>
        </form>
      )}
      {error && <Text className="text-ui-fg-error text-sm">{error}</Text>}
      {message && <Text className="text-ui-fg-success text-sm">{message}</Text>}
    </div>
  )
}

function RegisterSms() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // 1. Ввод телефона — pre-register
  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const phoneValid = phoneSchema.safeParse(phone)
    if (!phoneValid.success) {
      setError('Введите корректный номер телефона.')
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_URL}/auth/customer/otp/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone })
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 409 || (data?.message && data.message.includes('Actor already exists'))) {
        setError('Пользователь уже зарегистрирован. Войдите.')
        setLoading(false)
        return
      }
      if (res.ok) {
        setStep('otp')
        setMessage('Код отправлен на ваш номер. Введите его для завершения регистрации.')
      } else {
        setError(data.message || 'Ошибка отправки кода')
      }
    } catch (e) {
      setError('Ошибка сети или сервера')
    } finally {
      setLoading(false)
    }
  }

  // 2. Ввод OTP — register + create customer + authenticate
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
      // 1. register
      const res = await fetch(`${API_URL}/auth/customer/otp/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, otp })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token) {
        setError(data.message || 'Ошибка регистрации: неверный код или истёк срок действия.')
        setLoading(false)
        return
      }
      // 2. create customer
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
      if (!customerRes.ok || !customerData.customer) {
        setError(customerData.message || 'Ошибка создания пользователя')
        setLoading(false)
        return
      }
      // 3. authenticate
      const authRes = await fetch(`${API_URL}/auth/customer/otp/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: phone, otp })
      })
      const authData = await authRes.json().catch(() => ({}))
      if (!authRes.ok || !authData.token) {
        setError(authData.message || 'Ошибка входа после регистрации')
        setLoading(false)
        return
      }
      await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authData.token })
      })
      setMessage('Регистрация и вход завершены!')
      router.replace('/account')
    } catch (e) {
      setError('Ошибка сети или сервера')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading level="h2" className="text-2xl">Регистрация по SMS</Heading>
      {step === 'phone' && (
        <form onSubmit={handlePhone} className="flex flex-col gap-4">
          <PhoneInput value={phone} onChange={setPhone} disabled={loading} />
          <Button type="submit" isLoading={loading} className="w-full" variant="primary">Получить код</Button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={handleOtp} className="flex flex-col gap-4">
          <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          <Button type="submit" isLoading={loading} className="w-full" variant="primary">Зарегистрироваться</Button>
        </form>
      )}
      {error && <Text className="text-ui-fg-error text-sm">{error}</Text>}
      {message && <Text className="text-ui-fg-success text-sm">{message}</Text>}
    </div>
  )
}

function LoginEmailPass() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (!emailSchema.safeParse(email).success) {
      setError('Введите корректный email.')
      setLoading(false)
      return
    }
    if (!passwordSchema.safeParse(password).success) {
      setError('Пароль должен быть не менее 6 символов.')
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_URL}/auth/customer/emailpass/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok || !data.token) {
        setError(data.message || 'Неверный email или пароль.')
        setLoading(false)
        return
      }
      await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token })
      })
      router.replace('/account')
    } catch (e) {
      setError('Ошибка сети или сервера')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading level="h2" className="text-2xl">Вход по email/паролю</Heading>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          autoFocus
          autoComplete="email"
          className="w-full"
        />
        <Input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="current-password"
          className="w-full"
        />
        <Button type="submit" isLoading={loading} className="w-full" variant="primary">Войти</Button>
      </form>
      {error && <Text className="text-ui-fg-error text-sm">{error}</Text>}
    </div>
  )
}

function RegisterEmailPass() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    if (!emailSchema.safeParse(email).success) {
      setError('Введите корректный email.')
      setLoading(false)
      return
    }
    if (!passwordSchema.safeParse(password).success) {
      setError('Пароль должен быть не менее 6 символов.')
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${API_URL}/auth/customer/emailpass/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': PUBLISHABLE_KEY || '',
        },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok || !data.token) {
        setError(data.message || 'Ошибка регистрации.')
        setLoading(false)
        return
      }
      await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token })
      })
      router.replace('/account')
    } catch (e) {
      setError('Ошибка сети или сервера')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Heading level="h2" className="text-2xl">Регистрация по email/паролю</Heading>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
          autoFocus
          autoComplete="email"
          className="w-full"
        />
        <Input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          autoComplete="new-password"
          className="w-full"
        />
        <Button type="submit" isLoading={loading} className="w-full" variant="primary">Зарегистрироваться</Button>
      </form>
      {error && <Text className="text-ui-fg-error text-sm">{error}</Text>}
    </div>
  )
}

export default function AuthTabsPage() {
  const [tab, setTab] = useState<'login-sms' | 'register-sms' | 'login-email' | 'register-email'>('login-sms')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-8 border border-gray-100">
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={tab === 'login-sms' ? 'primary' : 'secondary'}
            className="w-1/2"
            onClick={() => setTab('login-sms')}
            type="button"
          >
            Вход по SMS
          </Button>
          <Button
            variant={tab === 'register-sms' ? 'primary' : 'secondary'}
            className="w-1/2"
            onClick={() => setTab('register-sms')}
            type="button"
          >
            Регистрация по SMS
          </Button>
          <Button
            variant={tab === 'login-email' ? 'primary' : 'secondary'}
            className="w-1/2"
            onClick={() => setTab('login-email')}
            type="button"
          >
            Вход по email
          </Button>
          <Button
            variant={tab === 'register-email' ? 'primary' : 'secondary'}
            className="w-1/2"
            onClick={() => setTab('register-email')}
            type="button"
          >
            Регистрация по email
          </Button>
        </div>
        {tab === 'login-sms' && <LoginSms />}
        {tab === 'register-sms' && <RegisterSms />}
        {tab === 'login-email' && <LoginEmailPass />}
        {tab === 'register-email' && <RegisterEmailPass />}
      </div>
    </div>
  )
} 