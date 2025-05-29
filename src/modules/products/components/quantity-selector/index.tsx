'use client'

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"

interface QuantityOption {
  quantity: number
  price: number
  originalPrice?: number
  discount?: number
  label?: string
}

interface QuantitySelectorProps {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  onQuantityChange: (quantity: number, price: number) => void
  selectedQuantity?: number
}

const QuantitySelector = ({ 
  product, 
  region, 
  onQuantityChange, 
  selectedQuantity = 1 
}: QuantitySelectorProps) => {
  const [selected, setSelected] = useState(selectedQuantity)

  // Получаем базовую цену товара
  const baseVariant = product.variants?.[0]
  const basePrice = baseVariant?.calculated_price?.calculated_amount || 0

  // Определяем варианты количества со скидками
  const quantityOptions: QuantityOption[] = [
    {
      quantity: 1,
      price: basePrice,
      label: "1 шт"
    },
    {
      quantity: 2,
      price: basePrice * 2 * 0.95, // 5% скидка
      originalPrice: basePrice * 2,
      discount: 5,
      label: "2 шт"
    },
    {
      quantity: 3,
      price: basePrice * 3 * 0.9, // 10% скидка
      originalPrice: basePrice * 3,
      discount: 10,
      label: "3 шт"
    },
    {
      quantity: 5,
      price: basePrice * 5 * 0.85, // 15% скидка
      originalPrice: basePrice * 5,
      discount: 15,
      label: "5 шт"
    }
  ]

  const handleSelect = (option: QuantityOption) => {
    setSelected(option.quantity)
    onQuantityChange(option.quantity, option.price)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: region.currency_code?.toUpperCase() || 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price / 100)
  }

  return (
    <div className="space-y-3">
      <div className="text-gray-500 uppercase" style={{
        fontSize: "11px",
        fontWeight: 500,
        letterSpacing: "1.4px",
        lineHeight: 1.5,
        textTransform: "uppercase"
      }}>
        КОЛИЧЕСТВО
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {quantityOptions.map((option) => (
          <button
            key={option.quantity}
            onClick={() => handleSelect(option)}
            className={`relative p-3 border-2 rounded-lg transition-all duration-200 text-left ${
              selected === option.quantity
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col">
              <div className="text-sm font-medium mb-1">
                {option.label}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {formatPrice(option.price)}
                </span>
                
                {option.originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(option.originalPrice)}
                  </span>
                )}
              </div>
              
              {option.discount && (
                <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                  -{option.discount}%
                </div>
              )}
              
              {option.quantity > 1 && (
                <div className="text-xs text-gray-500 mt-1">
                  {formatPrice(option.price / option.quantity)} за шт
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500">
        Чем больше количество, тем выгоднее цена за единицу товара
      </div>
    </div>
  )
}

export default QuantitySelector 