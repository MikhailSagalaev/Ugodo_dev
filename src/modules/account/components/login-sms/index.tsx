'use client'

import React, { useState } from 'react'
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

  // TODO: Раскомментировать и настроить, если используется Medusa React SDK для управления состоянием
  // import { useAccount } from "@lib/context/account-context"
  // const { refetchCustomer, loginView } = useAccount()

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
      const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (publishableApiKey) {
        headers['x-publishable-api-key'] = publishableApiKey
      }

      const response = await fetch(`${apiBaseUrl}/store/auth/customer/otp/pre-register`, {
        method: 'POST',
        headers: headers, 
        body: JSON.stringify({ phone: identifier }),
      })

      const data = await response.json()

      if (!response.ok) { // fetch не выбрасывает ошибку на HTTP error статусах, нужна проверка .ok
        throw new Error(data.message || 'Не удалось запросить OTP. Попробуйте снова.');
      }
      setMessage(data.message || 'Код OTP был отправлен на ваш номер.')
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка при запросе OTP.')
    }
    finally {
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
      const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (publishableApiKey) {
        defaultHeaders['x-publishable-api-key'] = publishableApiKey
      }

      let registerData: any;
      let registerResponseOk: boolean;

      try {
        const registerResponse = await fetch(`${apiBaseUrl}/store/auth/customer/otp/register`, {
            method: 'POST',
            headers: defaultHeaders, 
            body: JSON.stringify({ phone: identifier, otp }),
        });
        registerResponseOk = registerResponse.ok;
        registerData = await registerResponse.json();

        if (!registerResponseOk) {
            throw new Error(registerData.message || 'Ошибка на этапе /otp/register');
        }
      } catch (registrationError: any) {
        console.warn('OTP registration failed, attempting login with /otp/verify:', registrationError);
        
        const verifyLoginResponse = await fetch(`${apiBaseUrl}/store/auth/customer/otp/verify`, {
            method: 'POST',
            headers: defaultHeaders, 
            body: JSON.stringify({ phone: identifier, otp }),
        });
        const verifyLoginData = await verifyLoginResponse.json();

        if (!verifyLoginResponse.ok || !verifyLoginData.token) {
            throw new Error(verifyLoginData.message || registrationError.message || 'Неверный OTP или пользователь не найден.');
        }
        setMessage('Вход выполнен успешно! Вы будете перенаправлены.');
        console.log('Existing user logged in. JWT:', verifyLoginData.token, 'Customer:', verifyLoginData.customer);
        setTimeout(() => setCurrentView(LOGIN_VIEW.SIGN_IN), 2000);
        return; 
      }
      
      const registrationToken = registerData?.token;
      if (!registrationToken) {
        throw new Error(registerData?.message || 'Не удалось получить токен регистрации.')
      }

      const createCustomerHeaders: HeadersInit = { ...defaultHeaders, 'Authorization': `Bearer ${registrationToken}` };
      // defaultHeaders уже содержит publishableApiKey, если он есть

      const createCustomerResponse = await fetch(`${apiBaseUrl}/store/customers`, {
        method: 'POST',
        headers: createCustomerHeaders, 
        body: JSON.stringify({ phone: identifier }),
      });

      const createCustomerData = await createCustomerResponse.json();
      if (!createCustomerResponse.ok || !createCustomerData.customer) {
        throw new Error(createCustomerData.message || 'Не удалось создать пользователя.');
      }
      console.log('New customer created:', createCustomerData.customer);

      const authResponse = await fetch(`${apiBaseUrl}/store/auth/customer/otp/authenticate`, {
        method: 'POST',
        headers: defaultHeaders, 
        body: JSON.stringify({ phone: identifier, otp }),
      });

      const authData = await authResponse.json();
      if (!authResponse.ok || !authData.token) {
        throw new Error(authData.message || 'Не удалось аутентифицировать нового пользователя.');
      }

      setMessage('Регистрация и вход выполнены успешно! Вы будете перенаправлены.');
      console.log('New user registered and logged in. JWT:', authData.token, 'Customer:', authData.customer || createCustomerData.customer);
      
      setTimeout(() => {
        setCurrentView(LOGIN_VIEW.SIGN_IN)
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Произошла непредвиденная ошибка при верификации OTP.');
    } finally {
      setIsLoading(false)
    }
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
      <Button 
        variant="transparent"
        onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
        className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover mt-2"
        data-testid="standard-login-button"
      >
        Войти по email и паролю
      </Button>
    </div>
  )
}

export default LoginSMS 