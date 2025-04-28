'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { HttpTypes } from '@medusajs/types' 
import {
  getWishlist,
  addToWishlist as apiAddToWishlist, // Ожидаем Wishlist | null
  removeFromWishlist as apiRemoveFromWishlist, // Ожидаем Wishlist | null
} from '@lib/data/wishlist'
import { useAccount } from "@lib/contexts/account"

// Определяем типы для контекста
interface WishlistContextType {
  wishlist: HttpTypes.StoreCart | null // Используем тип Cart, т.к. структура похожа
  wishlistItems: HttpTypes.StoreLineItem[] // Массив элементов
  wishlistItemIds: string[] // Массив ID вариантов в избранном
  loading: boolean // Индикатор загрузки при запросах
  error: string | null
  addItem: (variantId: string) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  isInWishlist: (variantId: string) => boolean
  getItemFromWishlist: (variantId: string) => HttpTypes.StoreLineItem | undefined
}

// Создаем контекст
const WishlistContext = createContext<WishlistContextType | null>(null)

// Провайдер контекста
export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<HttpTypes.StoreCart | null>(null)
  const [loading, setLoading] = useState<boolean>(true) // Начинаем с true для начальной загрузки
  const [error, setError] = useState<string | null>(null)
  const { customer, retrievingCustomer } = useAccount() // Получаем статус пользователя

  // Функция для загрузки списка избранного с бэкенда
  const fetchWishlist = useCallback(async () => {
    if (!customer) { // Не грузим, если пользователь не авторизован
        setWishlist(null)
        setLoading(false)
        return;
    }
    console.log("[WishlistContext] Fetching wishlist from API...")
    setLoading(true)
    setError(null)
    try {
      const currentWishlist = await getWishlist() // Вызываем реальную API функцию
      console.log("[WishlistContext] Fetched wishlist:", currentWishlist)
      setWishlist(currentWishlist)
    } catch (err: any) {
      setError("Не удалось загрузить список избранного: " + (err.message || 'Неизвестная ошибка'))
      console.error("[WishlistContext] fetchWishlist error:", err);
      setWishlist(null) // Сбрасываем в случае ошибки
    } finally {
      setLoading(false)
    }
  }, [customer]) // Зависимость от customer

  // Загружаем список при монтировании и при изменении пользователя
  useEffect(() => {
    // Ждем, пока завершится определение пользователя
    if (!retrievingCustomer) {
        fetchWishlist()
    }
  }, [fetchWishlist, retrievingCustomer])


  // Производные состояния: массив элементов и массив ID вариантов
  const wishlistItems = React.useMemo(() => wishlist?.items || [], [wishlist])
  const wishlistItemIds = React.useMemo(() => wishlistItems.map(item => item.variant_id).filter(Boolean) as string[], [wishlistItems])

  // Функция добавления элемента (использует реальное API)
  const addItem = async (variantId: string) => {
    console.log("[WishlistContext] Attempting API add item. Variant ID:", variantId);
    if (!customer) {
      setError("Войдите в аккаунт, чтобы добавить товар в избранное.")
      return;
    }
    
    setLoading(true)
    setError(null)
    try {
      const updatedWishlist = await apiAddToWishlist(variantId) // Вызываем реальную API функцию
      console.log("[WishlistContext] API addItem success. Updated wishlist:", updatedWishlist);
       if (updatedWishlist) {
          setWishlist(updatedWishlist) // Обновляем состояние из ответа API
       } else {
         // Если API вернуло null (или не вернуло wishlist), можно попробовать перезагрузить
         console.warn("[WishlistContext] addItem API did not return wishlist, refetching...");
         await fetchWishlist();
       }
    } catch (err: any) {
      setError("Ошибка при добавлении в избранное: " + (err.message || 'Неизвестная ошибка'))
      console.error("[WishlistContext] API addItem error:", err);
    } finally {
      setLoading(false)
      console.log("[WishlistContext] API add item finished.");
    }
  }

  // Функция удаления элемента (использует реальное API)
  const removeItem = async (itemId: string) => {
     console.log("[WishlistContext] Attempting API remove item. Item ID:", itemId);
     if (!customer) {
      setError("Войдите в аккаунт, чтобы управлять избранным.")
      return;
    }
    
    setLoading(true)
    setError(null)
    try {
      const updatedWishlist = await apiRemoveFromWishlist(itemId) // Вызываем реальную API функцию
       console.log("[WishlistContext] API removeItem success. Updated wishlist:", updatedWishlist);
        if (updatedWishlist) {
          setWishlist(updatedWishlist) // Обновляем состояние из ответа API
       } else {
          console.warn("[WishlistContext] removeItem API did not return wishlist, refetching...");
          await fetchWishlist();
       }
    } catch (err: any) {
      setError("Ошибка при удалении из избранного: " + (err.message || 'Неизвестная ошибка'))
      console.error("[WishlistContext] API removeItem error:", err);
    } finally {
      setLoading(false)
      console.log("[WishlistContext] API remove item finished.");
    }
  }

  // Хелпер: проверить, есть ли вариант в избранном
  const isInWishlist = useCallback((variantId: string) => {
    return wishlistItemIds.includes(variantId)
  }, [wishlistItemIds])

  // Хелпер: получить элемент списка по ID варианта
   const getItemFromWishlist = useCallback((variantId: string) => {
    return wishlistItems.find(item => item.variant_id === variantId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistItems,
        wishlistItemIds,
        loading,
        error,
        addItem,
        removeItem,
        isInWishlist,
        getItemFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

// Хук для использования контекста
export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (context === null) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
} 