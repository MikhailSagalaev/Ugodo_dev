"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { HttpTypes } from "@medusajs/types"

type CartNotificationProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  quantity: number
  isVisible: boolean
  onClose: () => void
}

export default function CartNotification({
  product,
  variant,
  quantity,
  isVisible,
  onClose
}: CartNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const productImage = product.images?.[0]?.url || product.thumbnail
  const productTitle = product.title || 'Товар'

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right duration-300">
      <div 
        className="bg-white shadow-lg border border-gray-200 rounded-lg"
        style={{ width: '360px', height: '110px' }}
      >
        <div className="p-5 flex items-center gap-4 h-full">
          {/* Картинка товара */}
          <div className="flex-shrink-0">
            {productImage ? (
              <Image
                src={productImage}
                alt={productTitle}
                width={70}
                height={70}
                className="object-cover rounded"
              />
            ) : (
              <div className="w-[70px] h-[70px] bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">Нет фото</span>
              </div>
            )}
          </div>

          {/* Информация о товаре */}
          <div className="flex-1 min-w-0">
            <div 
              className="text-black mb-1"
              style={{
                fontSize: '13px',
                fontWeight: 400,
                lineHeight: 1.1
              }}
            >
              добавлен в корзину
            </div>
            
            <h4 
              className="text-black mb-1 truncate"
              style={{
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.6
              }}
            >
              {productTitle}
            </h4>
            
            <div 
              className="text-gray-600"
              style={{
                fontSize: '9px',
                fontWeight: 500,
                lineHeight: 1.4
              }}
            >
              {quantity} шт.
            </div>
          </div>

          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Закрыть уведомление"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 