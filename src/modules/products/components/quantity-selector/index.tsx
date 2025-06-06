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

  console.log('QuantitySelector - product:', product)
  console.log('QuantitySelector - product.options:', product.options)

  // Проверяем есть ли опция "Количество штук в упаковке"
  const quantityOption = product.options?.find(option => 
    option.title?.toLowerCase().includes('количество')
  )

  // Получаем варианты количества из опций продукта или используем фиксированные скидки
  const quantityOptions: QuantityOption[] = (() => {
    console.log('QuantitySelector - quantityOption:', quantityOption)
    
    if (quantityOption && quantityOption.values) {
      console.log('QuantitySelector - using real variants from product options')
      // Используем реальные варианты из продукта
      return quantityOption.values
        .map(value => {
          const quantity = parseInt(value.value)
          if (isNaN(quantity)) return null
          
          // Находим соответствующий вариант продукта
          const variant = product.variants?.find(v => 
            v.options?.some(opt => 
              opt.option_id === quantityOption.id && opt.value === value.value
            )
          )
          
          const price = variant?.calculated_price?.calculated_amount || 0
          const pricePerUnit = price / quantity
          
          // Вычисляем скидку относительно цены за единицу самого маленького количества
          const baseVariant = product.variants?.find(v => 
            v.options?.some(opt => 
              opt.option_id === quantityOption.id && opt.value === "1"
            )
          )
          const basePrice = baseVariant?.calculated_price?.calculated_amount || price
          const basePricePerUnit = basePrice
          
          let discount = 0
          if (basePricePerUnit > 0 && pricePerUnit < basePricePerUnit) {
            discount = Math.round(((basePricePerUnit - pricePerUnit) / basePricePerUnit) * 100)
          }
          
          return {
            quantity,
            price,
            originalPrice: quantity > 1 ? basePricePerUnit * quantity : undefined,
            discount: discount > 0 ? discount : undefined,
            label: `${quantity} шт`
          }
        })
        .filter(Boolean)
        .sort((a, b) => a!.quantity - b!.quantity) as QuantityOption[]
    } else {
      console.log('QuantitySelector - using fallback fixed discounts')
      // Используем фиксированные скидки как fallback
      const baseVariant = product.variants?.[0]
      const basePrice = baseVariant?.calculated_price?.calculated_amount || 0
      
      return [
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
    }
  })()
  
  console.log('QuantitySelector - final quantityOptions:', quantityOptions)

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
        КОЛИЧЕСТВО / УПАКОВОК
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {quantityOptions.map((option) => (
          <button
            key={option.quantity}
            onClick={() => handleSelect(option)}
            className={`relative border-2 rounded-lg transition-all duration-200 text-center flex-shrink-0 ${
              selected === option.quantity
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            style={{ 
              minHeight: "60px",
              minWidth: "80px",
              maxWidth: "100px"
            }}
          >
            {/* Плашка выгоды сверху */}
            {option.discount && (
              <div 
                className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-black text-xs font-bold px-2 py-1 rounded-sm"
                style={{ 
                  backgroundColor: '#BAFF29',
                  fontSize: "9px",
                  fontWeight: 600
                }}
              >
                ВЫГОДА {option.discount}%
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center h-full p-2">
              {/* Количество */}
              <div className="text-base font-bold mb-1">
                {option.quantity}
              </div>
              
              {/* Цена за упаковку */}
              <div className="text-xs text-gray-600">
                {formatPrice(option.price)}
              </div>
              
              {/* Цена за штуку */}
              <div className="text-xs text-gray-500 mt-1">
                {formatPrice(option.price / option.quantity)} / шт
              </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="text-xs text-gray-500">
        Выберите количество упаковок
      </div>
    </div>
  )
}

export default QuantitySelector 