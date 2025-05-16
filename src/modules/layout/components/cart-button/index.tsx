'use client'

import { useState, useEffect, useRef } from 'react'
import CartDropdown from "../cart-dropdown"
// Убираем импорт LineItem
// import type { LineItem } from '@medusajs/medusa'
// Убираем импорт Cart
// import type { Cart } from '@medusajs/medusa'
// Импортируем HttpTypes
import { HttpTypes } from "@medusajs/types"

export default function CartButton() {
  // Используем HttpTypes.StoreCart | null для типа состояния
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Для таймаута скрытия

  useEffect(() => {
    const fetchCart = async () => {
      try {
        // Мы не можем напрямую импортировать retrieveCart, поэтому используем fetch
        const response = await fetch('/api/cart')
        if (response.ok) {
          const data = await response.json()
          setCart(data.cart)
        }
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])

  // Получаем общее количество товаров в корзине
  // Используем HttpTypes.StoreCartLineItem для типа item
  const itemsCount = cart?.items?.reduce((acc: number, item: HttpTypes.StoreCartLineItem) => acc + item.quantity, 0) || 0
  
  // Обработчики наведения мыши для выпадающего меню
  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    setIsOpen(true)
  }
  
  const handleMouseLeave = () => {
    // Устанавливаем таймаут для закрытия
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300) // 300 мс задержки
  }
  
  return (
    <div 
      className="relative" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className="flex items-center justify-center hover:text-ui-fg-base relative"
        aria-label="Корзина"
        onClick={() => {
          if (leaveTimeoutRef.current) { // Если есть таймаут на закрытие, отменяем его
            clearTimeout(leaveTimeoutRef.current)
            leaveTimeoutRef.current = null
          }
          setIsOpen(!isOpen) // Переключаем состояние по клику
        }}
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        
        {/* Индикатор количества товаров */}
        {itemsCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
            {itemsCount}
          </span>
        )}
      </button>
      
      {/* Выпадающее меню корзины */}
      <CartDropdown cart={cart} isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
