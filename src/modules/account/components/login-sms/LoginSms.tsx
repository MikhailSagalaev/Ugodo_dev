'use client'

import React, { useState } from 'react'
import { Button, Input, Label, Text, Heading } from '@medusajs/ui'
import { useRouter } from 'next/navigation'
import { testSmsApi } from '../../../../lib/test-api'
import { MEDUSA_BACKEND_URL } from '../../../../lib/config'
import { setMedusaAuthToken, redirectToAccount } from '../../../../lib/auth-utils'

// SVG иконки
const PhoneIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
)

const KeyIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
)

const ArrowLeftIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
)

const CheckCircleIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const API_URL = MEDUSA_BACKEND_URL
// Автоматически включается в development режиме, если не задано явно
const TEST_MODE = process.env.NEXT_PUBLIC_SMS_TEST_MODE === 'true' || 
                 (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_SMS_TEST_MODE !== 'false')
const TEST_OTP = '123456'

const LoginSms = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [useTestApi, setUseTestApi] = useState(false)
  const router = useRouter()

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.startsWith('8')) {
      return '+7' + numbers.slice(1)
    }
    if (numbers.startsWith('7')) {
      return '+' + numbers
    }
    if (numbers.length > 0 && !numbers.startsWith('7')) {
      return '+7' + numbers
    }
    return value
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!validatePhone(phone)) {
      setError('Введите корректный номер телефона')
      return
    }

    setIsLoading(true)

    try {
      // Пытаемся сначала использовать реальный API
      let response
      try {
        response = await fetch(`${API_URL}/auth/customer/otp/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: phone })
        })
      } catch (err) {
        // Если реальный API недоступен, используем тестовый
        console.log('[LoginSms] Real API unavailable, using test API')
        setUseTestApi(true)
        const result = await testSmsApi.generate(phone)
        if (result.success) {
          setSuccess('SMS с кодом отправлен! (Тестовый режим)')
          setTimeout(() => setStep('otp'), 1000)
        } else {
          setError(result.message || 'Ошибка отправки SMS')
        }
        setIsLoading(false)
        return
      }

      if (response.ok) {
        setSuccess('SMS с кодом отправлен!')
        setTimeout(() => setStep('otp'), 1000)
      } else {
        const data = await response.json()
        setError(data.message || 'Ошибка отправки SMS')
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (otp.length < 4) {
      setError('Введите код из SMS')
      return
    }

    if (TEST_MODE && otp !== TEST_OTP) {
      setError(`В тестовом режиме используйте код ${TEST_OTP}`)
      return
    }

    setIsLoading(true)

    try {
      if (useTestApi) {
        // Используем тестовый API
        const result = await testSmsApi.verify(phone, otp)
        if (result.success) {
          const authToken = result.token || result.access_token || 'test_token'
          await setMedusaAuthToken(authToken)
          setSuccess('Вход выполнен успешно! (Тестовый режим)')
          setTimeout(() => {
            redirectToAccount()
          }, 1000)
        } else {
          setError(result.message || 'Неверный код')
        }
      } else {
        // Используем реальный API с поддержкой тестового режима
        const endpoint = TEST_MODE ? 
          `${API_URL}/auth/customer/otp/verify-test` : 
          `${API_URL}/auth/customer/otp/verify`
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: phone, otp })
        })

              if (response.ok) {
        const data = await response.json()
        // Согласно документации @perseidesjs/auth-otp возвращается 'token'
        const authToken = data.token || data.access_token
        if (authToken) {
          // Сохраняем токен через utility функцию
          await setMedusaAuthToken(authToken)
          setSuccess('Вход выполнен успешно!')
          setTimeout(() => {
            redirectToAccount()
          }, 1000)
        } else {
          setError('Токен не получен')
        }
      } else {
        const data = await response.json()
        setError(data.message || 'Неверный код')
      }
      }
    } catch (err) {
      setError('Ошибка сети. Попробуйте позже.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setStep('phone')
    setPhone('')
    setOtp('')
    setError('')
    setSuccess('')
    setUseTestApi(false)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    if (formatted.length <= 12) {
      setPhone(formatted)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(value)
  }

  if (step === 'phone') {
    return (
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <PhoneIcon className="w-8 h-8 text-blue-600" />
          </div>
          <Heading level="h1" className="text-2xl font-bold text-gray-900 mb-2">
            Вход по SMS
          </Heading>
          <Text className="text-gray-600">
            Введите номер телефона для получения кода подтверждения
          </Text>
        </div>

        {/* Test Mode Banner */}
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <Text className="text-sm text-amber-700">
                <strong>Режим разработки:</strong> система автоматически переключится на тестовый API если основной недоступен
              </Text>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" />
                </svg>
              </div>
              <div className="ml-3">
                <Text className="text-sm text-red-700">{error}</Text>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <Text className="ml-3 text-sm text-green-700">{success}</Text>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Номер телефона
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 999 123 45 67"
                className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                autoComplete="tel"
              />
            </div>
            <Text className="mt-1 text-xs text-gray-500">
              Введите номер в формате +7 999 123 45 67
            </Text>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-2 focus:ring-2 focus:ring-offset-white text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            disabled={isLoading}
          >
            {isLoading ? 'Отправка...' : 'Получить код'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Text className="text-sm text-gray-600">
            Нет аккаунта?{' '}
            <button
              onClick={() => router.push('/account/register-sms')}
              className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
            >
              Зарегистрироваться
            </button>
          </Text>
        </div>
      </div>
    )
  }

  return (
          <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <KeyIcon className="w-8 h-8 text-green-600" />
        </div>
        <Heading level="h1" className="text-2xl font-bold text-gray-900 mb-2">
          Введите код
        </Heading>
        <Text className="text-gray-600">
          SMS с кодом отправлен на номер
        </Text>
        <Text className="font-semibold text-gray-900 mt-1">
          {phone}
        </Text>
      </div>

      {/* Test Mode Alert */}
      <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" />
            </svg>
          </div>
          <div className="ml-3">
            <Text className="text-sm text-amber-700">
              <strong>Тестовый режим:</strong> используйте код {TEST_OTP} {useTestApi && '(Тестовый API)'}
            </Text>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" />
              </svg>
            </div>
            <div className="ml-3">
              <Text className="text-sm text-red-700">{error}</Text>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
            <Text className="ml-3 text-sm text-green-700">{success}</Text>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleOtpSubmit} className="space-y-6">
        <div>
          <Label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            Код подтверждения
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="otp"
              name="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="123456"
              className="pl-10 block w-full text-center text-lg font-mono tracking-widest rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              maxLength={6}
              required
              autoComplete="one-time-code"
              autoFocus
            />
          </div>
          <Text className="mt-1 text-xs text-gray-500">
            Введите 6-значный код из SMS
          </Text>
        </div>

        <Button
          type="submit"
          isLoading={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500 focus:ring-offset-2 focus:ring-2 focus:ring-offset-white text-white font-medium py-3 px-4 rounded-lg transition duration-200"
          disabled={isLoading}
        >
          {isLoading ? 'Проверка...' : 'Войти'}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 space-y-3 text-center">
        <button
          onClick={resetForm}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-500 transition duration-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Изменить номер телефона
        </button>
        <div>
          <Text className="text-sm text-gray-600">
            Нет аккаунта?{' '}
            <button
              onClick={() => router.push('/account/register-sms')}
              className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
            >
              Зарегистрироваться
            </button>
          </Text>
        </div>
      </div>
    </div>
  )
}

export default LoginSms 