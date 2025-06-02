'use client'

import React, { useState } from 'react'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@medusajs/ui'

type FilterOption = {
  value: string
  label: string
  count?: number
}

type ProductFiltersProps = {
  products: HttpTypes.StoreProduct[]
  onFiltersChange: (filters: FilterState) => void
  className?: string
}

export type FilterState = {
  colors: string[]
  sizes: string[]
  materials: string[]
  priceRange: [number, number] | null
  categories: string[]
  hasDiscount: boolean
  inStock: boolean
  expressDelivery: boolean
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  products,
  onFiltersChange,
  className = ''
}) => {
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    sizes: [],
    materials: [],
    priceRange: null,
    categories: [],
    hasDiscount: false,
    inStock: false,
    expressDelivery: false
  })

  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    brand: false,
    country: false,
    productType: false,
    purpose: false,
    forWho: false,
    applicationArea: false,
    color: false
  })

  // Извлекаем уникальные значения из товаров
  const extractFilterOptions = () => {
    const colors = new Set<string>()
    const sizes = new Set<string>()
    const materials = new Set<string>()
    const categories = new Set<string>()
    let minPrice = Infinity
    let maxPrice = 0

    products.forEach(product => {
      // Цвета и размеры из вариантов
      product.variants?.forEach(variant => {
        variant.options?.forEach(option => {
          const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
          
          if (optionTitle?.includes('цвет') || optionTitle?.includes('color')) {
            colors.add(option.value)
          }
          
          if (optionTitle?.includes('размер') || optionTitle?.includes('size')) {
            sizes.add(option.value)
          }
        })

        // Цены
        if (variant.calculated_price?.calculated_amount) {
          const price = variant.calculated_price.calculated_amount / 100
          minPrice = Math.min(minPrice, price)
          maxPrice = Math.max(maxPrice, price)
        }
      })

      // Материалы
      if (product.material) {
        materials.add(product.material)
      }

      // Категории
      product.categories?.forEach(category => {
        categories.add(category.name)
      })
    })

    return {
      colors: Array.from(colors).map(color => ({ value: color, label: color })),
      sizes: Array.from(sizes).map(size => ({ value: size, label: size })),
      materials: Array.from(materials).map(material => ({ value: material, label: material })),
      categories: Array.from(categories).map(category => ({ value: category, label: category })),
      priceRange: minPrice !== Infinity ? [Math.floor(minPrice), Math.ceil(maxPrice)] as [number, number] : [25, 56865]
    }
  }

  const filterOptions = extractFilterOptions()

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    const newFilters = { ...filters }
    
    if (filterType === 'priceRange' || filterType === 'hasDiscount' || filterType === 'inStock' || filterType === 'expressDelivery') {
      newFilters[filterType] = value
    } else {
      const currentValues = newFilters[filterType] as string[]
      if (currentValues.includes(value)) {
        newFilters[filterType] = currentValues.filter(v => v !== value) as any
      } else {
        newFilters[filterType] = [...currentValues, value] as any
      }
    }
    
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      colors: [],
      sizes: [],
      materials: [],
      priceRange: null,
      categories: [],
      hasDiscount: false,
      inStock: false,
      expressDelivery: false
    }
    setFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== null && filter !== false
  )

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const filteredProductsCount = products.length // Здесь должна быть логика подсчета отфильтрованных товаров

  return (
    <div className={`bg-white ${className}`}>
      {/* Кнопка открытия фильтров */}
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 bg-white focus:outline-none focus:ring-0 hover:text-[#C2E7DA] transition-colors"
          style={{
            fontSize: "16px",
            fontWeight: 500,
            lineHeight: 1,
            padding: "8px 12px",
            border: "none"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Фильтры
          {hasActiveFilters && (
            <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
              {Object.values(filters).flat().filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Модальное окно фильтров */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white overflow-y-auto">
            {/* Заголовок */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium">фильтры</h3>
              <button onClick={() => setIsOpen(false)} className="p-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Основные чекбоксы */}
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.expressDelivery}
                    onChange={(e) => handleFilterChange('expressDelivery', e.target.checked)}
                    className="mr-3 w-4 h-4"
                  />
                  <span className="text-sm">экспресс-доставка</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.hasDiscount}
                    onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
                    className="mr-3 w-4 h-4"
                  />
                  <span className="text-sm">со скидкой</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="mr-3 w-4 h-4"
                  />
                  <span className="text-sm">в наличии</span>
                </label>
              </div>

              {/* Цена */}
              <div>
                <h4 className="font-medium mb-4">Цена</h4>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="range"
                      min={filterOptions.priceRange[0]}
                      max={filterOptions.priceRange[1]}
                      value={filters.priceRange?.[0] || filterOptions.priceRange[0]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        handleFilterChange('priceRange', [value, filters.priceRange?.[1] || filterOptions.priceRange[1]])
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>от {filters.priceRange?.[0] || filterOptions.priceRange[0]} ₽</span>
                    <span>до {filters.priceRange?.[1] || filterOptions.priceRange[1]} ₽</span>
                  </div>
                </div>
              </div>

              {/* Сворачиваемые секции */}
              {[
                { key: 'brand', title: 'бренд', options: [] },
                { key: 'country', title: 'страна бренда', options: [] },
                { key: 'productType', title: 'тип продукта', options: filterOptions.categories },
                { key: 'purpose', title: 'назначение', options: [] },
                { key: 'forWho', title: 'для кого', options: [] },
                { key: 'applicationArea', title: 'область применения', options: [] },
                { key: 'color', title: 'цвет', options: filterOptions.colors }
              ].map(section => (
                <div key={section.key} className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <span className="font-medium">+ {section.title}</span>
                  </button>
                  
                  {expandedSections[section.key] && section.options.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {section.options.map(option => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              section.key === 'color' ? filters.colors.includes(option.value) :
                              section.key === 'productType' ? filters.categories.includes(option.value) :
                              false
                            }
                            onChange={() => {
                              if (section.key === 'color') {
                                handleFilterChange('colors', option.value)
                              } else if (section.key === 'productType') {
                                handleFilterChange('categories', option.value)
                              }
                            }}
                            className="mr-2 w-4 h-4"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Кнопка применить */}
            <div className="p-6 border-t">
              <Button 
                onClick={() => setIsOpen(false)} 
                className="w-full bg-black text-white py-3 rounded-none"
              >
                показать {filteredProductsCount} товаров
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFilters 