'use client'

import { useState, useEffect, useRef } from 'react'
import CartSidebar from "../cart-sidebar"
// Убираем импорт LineItem
// import type { LineItem } from '@medusajs/medusa'
// Убираем импорт Cart
// import type { Cart } from '@medusajs/medusa'
// Импортируем HttpTypes
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import Image from "next/image"

export default function CartButton({ isScrolled = false }: { isScrolled?: boolean }) {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', { cache: 'no-store' })
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

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart/clear', { 
        method: 'POST',
        cache: 'no-store' 
      })
      if (response.ok) {
        await fetchCart()
      }
    } catch (error) {
      console.error('Ошибка при очистке корзины:', error)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart()
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const itemsCount = cart?.items?.reduce((acc: number, item: HttpTypes.StoreCartLineItem) => acc + item.quantity, 0) || 0
  
  return (
    <>
      <div className="relative">
        <button 
          className="flex items-center justify-center relative"
          aria-label="Корзина"
          onClick={() => setIsOpen(true)}
        >
          <svg 
            width="25" 
            height="25" 
            viewBox="0 0 22 22" 
            fill="none" 
            stroke={isScrolled ? "black" : "white"}
            className={clx("transition-colors duration-200 group-hover:stroke-black hover:stroke-[#C2E7DA]")}
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="1.5" 
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          
          {itemsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-xs rounded-full">
              {itemsCount}
            </span>
          )}
        </button>
      </div>
      
      <CartSidebar 
        cart={cart} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen}
        onClearCart={clearCart}
      />
    </>
  )
}
