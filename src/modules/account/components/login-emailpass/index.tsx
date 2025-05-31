/**
 * @file: index.tsx
 * @description: Форма входа по email/паролю для Ugodo
 * @dependencies: @medusajs/ui, sdk.auth.login, heroUI
 * @created: 2024-07-30
 */
'use client'

import React, { useState } from 'react'
import { Input, Button, Label, Text, Heading } from '@medusajs/ui'
import { useRouter } from 'next/navigation'

const LoginEmailPass = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.ugodo.ru'
      const publishableApiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      const response = await fetch(`${apiBaseUrl}/auth/customer/emailpass/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': publishableApiKey,
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok || !data.token) {
        throw new Error(data.message || 'Неверный email или пароль.')
      }
      // Сохраняем токен, если нужно (например, в localStorage/cookie)
      // localStorage.setItem('medusa_session_id', data.token)
      // После успешного входа — редирект
      router.push('/account')
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-y-6 p-4 md:p-0">
      <Heading level="h1" className="text-3xl leading-tight">Вход по email/паролю</Heading>
      <Text className="text-ui-fg-subtle text-center">Введите email и пароль для входа в личный кабинет.</Text>
      {error && (
        <div className="w-full p-3 my-2 text-center text-ui-fg-error bg-red-100 border border-red-200 rounded-md flex items-center gap-x-2 text-small-regular">
          <span>{error}</span>
        </div>
      )}
      <form className="w-full flex flex-col gap-y-4" onSubmit={handleLogin}>
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="email_input_emailpass" className="text-ui-fg-subtle">Email</Label>
          <Input
            id="email_input_emailpass"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="password_input_emailpass" className="text-ui-fg-subtle">Пароль</Label>
          <Input
            id="password_input_emailpass"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full" variant="primary">Войти</Button>
      </form>
    </div>
  )
}

export default LoginEmailPass 