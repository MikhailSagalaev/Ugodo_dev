'use client'

import { useState } from "react"

interface FiltersModalProps {
  isOpen: boolean
  onClose: () => void
  totalProducts: number
}

const FiltersModal = ({ isOpen, onClose, totalProducts }: FiltersModalProps) => {
  const [priceRange, setPriceRange] = useState({ min: 25, max: 56865 })
  const [selectedFilters, setSelectedFilters] = useState({
    expressDelivery: false,
    withDiscount: false,
    inStock: false,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative w-[480px] h-full bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 
              className="text-black"
              style={{
                fontSize: "30px",
                fontWeight: 500,
                letterSpacing: "-4px",
                lineHeight: 1.1
              }}
            >
              фильтры
            </h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={selectedFilters.expressDelivery}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, expressDelivery: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-gray-900">экспресс-доставка</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={selectedFilters.withDiscount}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, withDiscount: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-gray-900">со скидкой</span>
              </label>
              
              <label className="flex items-center space-x-3">
                <input 
                  type="checkbox" 
                  checked={selectedFilters.inStock}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-gray-900">в наличии</span>
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Цена</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">от {priceRange.min} ₽</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="25"
                    max="56865"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="range"
                    min="25"
                    max="56865"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer absolute top-0"
                  />
                </div>
                <span className="text-sm text-gray-600">до {priceRange.max} ₽</span>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-lg font-medium text-gray-900">+ бренд</span>
              </button>
              
              <button className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-lg font-medium text-gray-900">+ страна бренда</span>
              </button>
              
              <button className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-lg font-medium text-gray-900">+ тип продукта</span>
              </button>
              
              <button className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-lg font-medium text-gray-900">+ назначение</span>
              </button>
              
              <button className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-lg font-medium text-gray-900">+ для кого</span>
              </button>
              
              <button className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-lg font-medium text-gray-900">+ область применения</span>
              </button>
              
              <button className="w-full flex items-center justify-between py-3 text-left">
                <span className="text-lg font-medium text-gray-900">+ цвет</span>
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button 
            onClick={onClose}
            className="w-full bg-black text-white py-4 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            показать {totalProducts} товаров
          </button>
        </div>
      </div>
    </div>
  )
}

export default FiltersModal 