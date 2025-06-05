/**
 * @file: index.tsx
 * @description: Форма регистрации по email/паролю для Ugodo
 * @dependencies: @medusajs/ui, sdk.auth.register, sdk.store.customer.create, heroUI
 * @created: 2024-07-30
 */
'use client'

import React, { useState } from 'react'
import { Input, Button, Label, Text, Heading } from '@medusajs/ui'
import { useRouter } from 'next/navigation'
import { sdk } from '@lib/config'

const RegisterEmailPass = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      // 1. Получаем registration token
      const token = await sdk.auth.register('customer', 'emailpass', { email, password })
      // 2. Создаём customer
      await sdk.store.customer.create({ email, first_name: firstName, last_name: lastName }, {}, { Authorization: `Bearer ${token}` })
      // 3. Логинимся
      await sdk.auth.login('customer', 'emailpass', { email, password })
      // 4. Редирект
      router.push('/account')
    } catch (err: any) {
      setError(err.message || 'Ошибка при регистрации.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-y-6 p-4 md:p-0">
      <Heading level="h1" className="text-3xl leading-tight">Регистрация по email/паролю</Heading>
      <Text className="text-ui-fg-subtle text-center">Заполните данные для регистрации. После регистрации вы сможете войти в личный кабинет.</Text>
      {error && (
        <div className="w-full p-3 my-2 text-center text-ui-fg-error bg-red-100 border border-red-200 rounded-md flex items-center gap-x-2 text-small-regular">
          <span>{error}</span>
        </div>
      )}
      <form className="w-full flex flex-col gap-y-4" onSubmit={handleRegister}>
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="email_input_reg_emailpass" className="text-ui-fg-subtle">Email</Label>
          <Input
            id="email_input_reg_emailpass"
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
          <Label htmlFor="password_input_reg_emailpass" className="text-ui-fg-subtle">Пароль</Label>
          <Input
            id="password_input_reg_emailpass"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="first_name_input_reg_emailpass" className="text-ui-fg-subtle">Имя</Label>
          <Input
            id="first_name_input_reg_emailpass"
            name="first_name"
            type="text"
            placeholder="Имя"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />
        </div>
        <div className="flex flex-col gap-y-1.5">
          <Label htmlFor="last_name_input_reg_emailpass" className="text-ui-fg-subtle">Фамилия</Label>
          <Input
            id="last_name_input_reg_emailpass"
            name="last_name"
            type="text"
            placeholder="Фамилия"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full" variant="primary">Зарегистрироваться</Button>
      </form>
    </div>
  )
}

export default RegisterEmailPass 