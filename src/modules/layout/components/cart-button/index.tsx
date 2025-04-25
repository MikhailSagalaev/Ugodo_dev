'use client'

import { useState, useEffect, useRef } from 'react'
import CartDropdown from "../cart-dropdown"

export default function CartButton() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
  const itemsCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
  
  // Обработчики наведения мыши для выпадающего меню
  const handleMouseEnter = () => {
    setIsOpen(true)
  }
  
  const handleMouseLeave = () => {
    setIsOpen(false)
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
        onClick={() => setIsOpen(!isOpen)}
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
