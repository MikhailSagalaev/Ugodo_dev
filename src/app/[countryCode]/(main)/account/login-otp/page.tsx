'use client'

import React, { useState } from 'react'
import { Input, Button, Label } from "@medusajs/ui" // Импортируем Button и Label из @medusajs/ui
// import Button from "@/modules/common/components/button" // Удаляем старый импорт
// Возможно, вам понадобится useRouter для перенаправления
// import { useRouter } from 'next/navigation' 

const OtpLoginPage = () => {
  // const router = useRouter() // для перенаправления после успеха
  const [step, setStep] = useState(1) 
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

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
      const response = await fetch(`${apiBaseUrl}/store/auth/customer/otp/pre-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Не удалось запросить OTP. Попробуйте снова.')
      }
      setMessage(data.message || 'Код OTP был отправлен на ваш номер.')
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка.')
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
      
      const loginResponse = await fetch(`${apiBaseUrl}/store/auth/customer/otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, otp }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok || !loginData.token) {
        throw new Error(loginData.message || 'Не удалось войти или создать аккаунт после OTP верификации.');
      }

      // Успешный вход/регистрация
      // TODO: Сохранить JWT токен (loginData.token) и обновить состояние аутентификации
      // Это зависит от того, как вы управляете состоянием в вашем Next.js приложении.
      // Если используете Medusa React SDK, это может включать вызов authenticate() или refetchCustomer()
      // localStorage.setItem('medusa_session_id', loginData.token); // Пример, зависит от вашей конфигурации Medusa
      // localStorage.setItem('medusa_cart_id', loginData.customer.metadata?.cart_id); // Пример
      console.log('User logged in or registered successfully. JWT:', loginData.token, 'Customer:', loginData.customer);

      setMessage('Вход выполнен успешно!');
      
      // TODO: Реализовать перенаправление, например:
      // router.push('/account'); 

      // Сброс формы
      // setStep(1); // Возможно, лучше перенаправить, чем сбрасывать
      // setIdentifier('');
      // setOtp('');

    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при верификации или входе.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center py-12">
      <div className="max-w-md w-full flex flex-col items-center gap-y-6">
        <h1 className="text-2xl-semi">Вход или Регистрация по OTP</h1>
        
        {error && (
          <div className="text-rose-500 text-small-regular py-2">{error}</div>
        )}
        {message && (
          <div className="text-green-500 text-small-regular py-2">{message}</div>
        )}

        {step === 1 && (
          <form className="w-full flex flex-col gap-y-4" onSubmit={(e) => {e.preventDefault(); handleRequestOtp();}}>
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="identifier_input">Номер телефона</Label>
              <Input
                id="identifier_input"
                name="identifier"
                type="tel"
                placeholder="+7 (XXX) XXX-XX-XX"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="tel"
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Получить код
            </Button>
          </form>
        )}

        {step === 2 && (
          <form className="w-full flex flex-col gap-y-4" onSubmit={(e) => {e.preventDefault(); handleVerifyOtpAndRegister();}}>
            <p className="text-center text-ui-fg-subtle">
              Код отправлен на номер: {identifier}
            </p>
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="otp_input">Код OTP</Label>
              <Input
                id="otp_input"
                name="otp"
                type="text" // Можно поменять на "number" или "tel" для лучшего UX на мобильных
                inputMode="numeric" // Помогает показать цифровую клавиатуру
                pattern="[0-9]*"    // Для валидации, если нужно
                maxLength={6}       // Если OTP всегда 6 цифр
                placeholder="XXXXXX"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoComplete="one-time-code"
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Войти / Зарегистрироваться
            </Button>
            <Button variant="secondary" onClick={() => {setStep(1); setError(null); setMessage(null); setOtp('');}} className="w-full">
              Изменить номер
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default OtpLoginPage