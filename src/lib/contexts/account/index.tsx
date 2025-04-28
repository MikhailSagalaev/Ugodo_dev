'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { HttpTypes } from '@medusajs/types'
// ПРЕДПОЛАГАЕТСЯ, что эти функции существуют и работают:
import { retrieveCustomer, /* loginCustomer, */ signout as signoutCustomer } from '@lib/data/customer'

interface AccountContextType {
  customer: Omit<HttpTypes.StoreCustomer, "password_hash"> | null
  retrievingCustomer: boolean
  checkSession: () => void
  refetchCustomer: () => Promise<void>
  // handleLogin: (/* параметры для логина */) => Promise<string | undefined> // Функция логина пока закомментирована
  handleLogout: () => Promise<void>
}

const AccountContext = createContext<AccountContextType | null>(null)

export const AccountProvider = ({ children }: { children: React.ReactNode }) => {
  const [customer, setCustomer] = useState<Omit<HttpTypes.StoreCustomer, "password_hash"> | null>(null)
  const [retrievingCustomer, setRetrievingCustomer] = useState(true)

  const fetchCustomer = useCallback(async () => {
    setRetrievingCustomer(true)
    try {
      const currentCustomer = await retrieveCustomer() // Ваша функция для получения данных
      setCustomer(currentCustomer)
    } catch (e) {
      setCustomer(null) // Сбрасываем пользователя при ошибке
      console.error("AccountProvider: Failed to retrieve customer", e)
    } finally {
      setRetrievingCustomer(false)
    }
  }, [])

  // Проверяем сессию при монтировании
  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  const checkSession = useCallback(() => {
    if (!customer && !retrievingCustomer) {
      fetchCustomer()
    }
  }, [customer, retrievingCustomer, fetchCustomer])

  const refetchCustomer = useCallback(async () => {
    await fetchCustomer()
  }, [fetchCustomer])

  // const handleLogin = useCallback(async (/* параметры для логина */): Promise<string | undefined> => {
  //   setRetrievingCustomer(true)
  //   try {
  //     // await loginCustomer(/* ... */) // Ваша функция логина
  //     await fetchCustomer() // Обновляем данные пользователя после логина
  //     return undefined // Успех
  //   } catch (e: any) {
  //     console.error("AccountProvider: Failed to login", e)
  //     setRetrievingCustomer(false)
  //     return e.message || "Не удалось войти."
  //   }
  // }, [fetchCustomer])

  const handleLogout = useCallback(async () => {
    setRetrievingCustomer(true)
    try {
      // Используем signout из customer data, переименованный в signoutCustomer
      await signoutCustomer() 
      setCustomer(null) // Сбрасываем пользователя локально
    } catch (e) {
      console.error("AccountProvider: Failed to logout", e)
      // Не сбрасываем retrievingCustomer в false при ошибке, чтобы не показывать контент
    } finally {
       // В любом случае ставим false, т.к. пользователь вышел или произошла ошибка
       setRetrievingCustomer(false) 
    }
  }, [])

  return (
    <AccountContext.Provider value={{
      customer,
      retrievingCustomer,
      checkSession,
      refetchCustomer,
      // handleLogin, // Пока не включаем
      handleLogout
    }}>
      {children}
    </AccountContext.Provider>
  )
}

export const useAccount = () => {
  const context = useContext(AccountContext)
  if (context === null) {
    throw new Error("useAccount must be used within an AccountProvider")
  }
  return context
}

// Экспортируем Provider по умолчанию для использования в layout.tsx
export default AccountProvider; 