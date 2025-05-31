'use client'

import React, { useState, useRef } from 'react'
import { Input, Button, Label, Text, Heading, clx } from "@medusajs/ui"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { InformationCircleSolid } from "@medusajs/icons"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const LoginSMS = ({ setCurrentView }: Props) => {
  const [step, setStep] = useState(1) // 1 for phone input, 2 for OTP input
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [needRegistration, setNeedRegistration] = useState(false)
  const registrationTokenRef = useRef<string | null>(null)

  // TODO: Раскомментировать и настроить, если используется Medusa React SDK для управления состоянием
  // import { useAccount } from "@lib/context/account-context"
  // const { refetchCustomer, loginView } = useAccount()

  const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''

  const handleRequestOtp = async () => {
    if (!identifier) {
      setError('Пожалуйста, введите номер телефона.')
      return
    }
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.ugodo.ru'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableApiKey || '',
      }
      const response = await fetch(`${apiBaseUrl}/auth/customer/otp/pre-register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ identifier }),
      })
      const data = await response.json()
      if (response.ok) {
        setMessage(data.message || 'Код OTP был отправлен на ваш номер.')
        setStep(2)
      } else if (
        data.message?.toLowerCase().includes('actor already exists') ||
        response.status === 409 || response.status === 400
      ) {
        // Пользователь уже есть — вызываем /verify для генерации OTP
        try {
          const verifyResponse = await fetch(`${apiBaseUrl}/auth/customer/otp/verify`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ identifier }),
          })
          const verifyData = await verifyResponse.json()
          if (verifyResponse.ok) {
            setMessage(verifyData.message || 'Код OTP был отправлен на ваш номер.');
            setStep(2)
          } else {
            throw new Error(verifyData.message || 'Не удалось запросить OTP повторно.');
          }
        } catch (verifyErr: any) {
          setError(verifyErr.message || 'Ошибка при повторном запросе OTP.')
        }
      } else {
        throw new Error(data.message || 'Не удалось запросить OTP. Попробуйте снова.')
      }
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка при запросе OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAuthenticate = async (token: string | null, isExistingUser = false) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.ugodo.ru'
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableApiKey || '',
      }
      const authResponse = await fetch(`${apiBaseUrl}/auth/customer/otp/authenticate`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify({ identifier, otp }),
      })
      const authData = await authResponse.json()
      if (!authResponse.ok || !authData.token) {
        throw new Error(authData.message || 'Не удалось аутентифицировать пользователя.')
      }
      // После успешной аутентификации — можно делать GET /store/customers/me
      const meResponse = await fetch(`${apiBaseUrl}/store/customers/me`, {
        method: 'GET',
        headers: {
          ...defaultHeaders,
          'Authorization': `Bearer ${authData.token}`,
        },
      })
      if (!meResponse.ok) {
        throw new Error('Ошибка при получении данных пользователя после аутентификации.')
      }
      setMessage('Вход выполнен успешно!')
      setTimeout(() => {
        setCurrentView(LOGIN_VIEW.SIGN_IN)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Ошибка при аутентификации.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtpAndRegister = async () => {
    if (!otp) {
      setError('Пожалуйста, введите OTP код.')
      return
    }
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.ugodo.ru'
      const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableApiKey || '',
      }
      // 1. Пробуем register
      const registerResponse = await fetch(`${apiBaseUrl}/auth/customer/otp/register`, {
            method: 'POST',
            headers: defaultHeaders, 
        body: JSON.stringify({ identifier, otp }),
      })
      const registerData = await registerResponse.json()
      if (registerResponse.ok && registerData.token) {
        // Новый пользователь: создаём Customer, затем authenticate
        registrationTokenRef.current = registerData.token
        setNeedRegistration(true)
        setMessage('Пожалуйста, заполните email и имя для завершения регистрации.')
        setIsLoading(false)
        return
      } else if (
        registerResponse.status === 401 ||
        registerData.message?.toLowerCase().includes('actor already exists')
      ) {
        // Существующий пользователь: сразу authenticate
        await handleAuthenticate(null, true)
        return
      } else {
        throw new Error(registerData.message || 'Ошибка на этапе /otp/register')
      }
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка при верификации OTP.')
      setIsLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    // Если email не введён, генерируем его автоматически
    const emailToUse = email || `phone+${identifier.replace(/\D/g, '')}@ugodo.local`
    if (!email && !emailToUse) {
      setError('Пожалуйста, введите email или используйте номер телефона.')
      return
    }
    setIsLoading(true)
    setError(null)
    setMessage(null)
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.ugodo.ru'
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'x-publishable-api-key': publishableApiKey || '',
      }
      const registrationToken = registrationTokenRef.current
      const createCustomerHeaders: HeadersInit = {
        ...defaultHeaders,
        'Authorization': `Bearer ${registrationToken}`,
      }
      const createCustomerResponse = await fetch(`${apiBaseUrl}/store/customers`, {
        method: 'POST',
        headers: createCustomerHeaders, 
        body: JSON.stringify({ email: emailToUse, phone: identifier, first_name: firstName, last_name: lastName }),
      })
      const createCustomerData = await createCustomerResponse.json()
      if (!createCustomerResponse.ok || !createCustomerData.customer) {
        throw new Error(createCustomerData.message || 'Не удалось создать пользователя.')
      }
      // После успешного создания — authenticate
      await handleAuthenticate(registrationToken as string)
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании пользователя.')
    } finally {
      setIsLoading(false)
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('PK:', process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY)
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-y-6 p-4 md:p-0">
      <Heading level="h1" className="text-3xl leading-tight">
        Вход по SMS
      </Heading>
      <Text className="text-ui-fg-subtle text-center">
        Введите номер телефона, и мы отправим вам код для входа или регистрации.
      </Text>
      
      {/* Сообщения об ошибках и успехах */} 
      {error && (
        <div className="w-full p-3 my-2 text-center text-ui-fg-error bg-red-100 border border-red-200 rounded-md flex items-center gap-x-2 text-small-regular">
          <InformationCircleSolid /> 
          <span>{error}</span>
        </div>
      )}
      {message && !error && (
        <div className="w-full p-3 my-2 text-center text-ui-fg-interactive bg-green-100 border border-green-200 rounded-md flex items-center gap-x-2 text-small-regular">
          <InformationCircleSolid />
          <span>{message}</span>
        </div>
      )}

      {step === 1 && (
        <form className="w-full flex flex-col gap-y-4" onSubmit={(e) => {e.preventDefault(); handleRequestOtp();}}>
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="identifier_input_sms" className="text-ui-fg-subtle">Номер телефона</Label>
            <Input
              id="identifier_input_sms"
              name="identifier"
              type="tel"
              placeholder="+7 (XXX) XXX-XX-XX"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="tel"
              aria-describedby={error ? "error-message-identifier" : undefined}
            />
            {error && <Text id="error-message-identifier" className="text-rose-500 text-small-regular">{error}</Text>}
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full" variant="primary">
            Получить код
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className="w-full flex flex-col gap-y-4" onSubmit={(e) => {e.preventDefault(); handleVerifyOtpAndRegister();}}>
          <Text className="text-center text-ui-fg-subtle">
            Код подтверждения отправлен на номер: <span className="font-medium text-ui-fg-base">{identifier}</span>
          </Text>
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="otp_input_sms" className="text-ui-fg-subtle">Код OTP</Label>
            <Input
              id="otp_input_sms"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="XXXXXX"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              autoComplete="one-time-code"
              aria-describedby={error ? "error-message-otp" : undefined}
            />
            {error && <Text id="error-message-otp" className="text-rose-500 text-small-regular">{error}</Text>}
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full" variant="primary">
            Войти / Зарегистрироваться
          </Button>
          <Button variant="secondary" onClick={() => {setStep(1); setError(null); setMessage(null); setOtp('');}} className="w-full">
            Изменить номер
          </Button>
        </form>
      )}

      {needRegistration && (
        <form className="w-full flex flex-col gap-y-4" onSubmit={(e) => {e.preventDefault(); handleCreateCustomer();}}>
          <Label htmlFor="email_input_sms" className="text-ui-fg-subtle">Email <span className="text-xs text-ui-fg-muted">(необязательно, можно добавить позже)</span></Label>
          <Input
            id="email_input_sms"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-describedby={error ? "error-message-email" : undefined}
          />
          <Text className="text-xs text-ui-fg-muted">Если не указать email, он будет сгенерирован автоматически на основе номера телефона. Вы сможете добавить email позже для восстановления доступа.</Text>
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="first_name_input_sms" className="text-ui-fg-subtle">Имя</Label>
            <Input
              id="first_name_input_sms"
              name="first_name"
              type="text"
              placeholder="Имя"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>
          <div className="flex flex-col gap-y-1.5">
            <Label htmlFor="last_name_input_sms" className="text-ui-fg-subtle">Фамилия</Label>
            <Input
              id="last_name_input_sms"
              name="last_name"
              type="text"
              placeholder="Фамилия"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>
          <Button type="submit" isLoading={isLoading} className="w-full" variant="primary">
            Завершить регистрацию
      </Button>
        </form>
      )}
    </div>
  )
}

export default LoginSMS 