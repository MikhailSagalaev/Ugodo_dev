'use client'

import React, { useState, useMemo } from 'react'
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
  currentCategory?: HttpTypes.StoreProductCategory
}

export type FilterState = {
  colors: string[]
  sizes: string[]
  materials: string[]
  brands: string[]
  priceRange: [number, number] | null
  categories: string[]
  hasDiscount: boolean
  inStock: boolean
  gender: string[]
  season: string[]
  skinType: string[]
  purpose: string[]
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  products,
  onFiltersChange,
  className = '',
  currentCategory
}) => {
  const [filters, setFilters] = useState<FilterState>({
    colors: [],
    sizes: [],
    materials: [],
    brands: [],
    priceRange: null,
    categories: [],
    hasDiscount: false,
    inStock: false,
    gender: [],
    season: [],
    skinType: [],
    purpose: []
  })

  const [localFilters, setLocalFilters] = useState<FilterState>({
    colors: [],
    sizes: [],
    materials: [],
    brands: [],
    priceRange: null,
    categories: [],
    hasDiscount: false,
    inStock: false,
    gender: [],
    season: [],
    skinType: [],
    purpose: []
  })

  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    color: false,
    size: false,
    brand: false,
    material: false,
    gender: false,
    season: false,
    skinType: false,
    purpose: false
  })

  const [showAllOptions, setShowAllOptions] = useState<Record<string, boolean>>({})
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})

  const extractFilterOptions = () => {
    const colors = new Set<string>()
    const sizes = new Set<string>()
    const materials = new Set<string>()
    const brands = new Set<string>()
    const categories = new Set<string>()
    const genders = new Set<string>()
    const seasons = new Set<string>()
    const skinTypes = new Set<string>()
    const purposes = new Set<string>()
    const prices: number[] = []

    products.forEach(product => {
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

        const priceAmount = variant.calculated_price?.calculated_amount
        if (priceAmount && priceAmount > 0) {
          prices.push(typeof priceAmount === 'string' ? parseFloat(priceAmount) : priceAmount)
        }
      })

      if (product.material) {
        materials.add(product.material)
      }

      if (product.metadata?.brand) {
        brands.add(product.metadata.brand as string)
      }

      if (product.metadata?.gender) {
        genders.add(product.metadata.gender as string)
      }

      if (product.metadata?.season) {
        seasons.add(product.metadata.season as string)
      }

      if (product.metadata?.skin_type) {
        skinTypes.add(product.metadata.skin_type as string)
      }

      if (product.metadata?.purpose) {
        purposes.add(product.metadata.purpose as string)
      }

      product.categories?.forEach(category => {
        categories.add(category.name)
      })
    })

    if (prices.length === 0) {
      return { min: 0, max: 10000 }
    }

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    return {
      colors: Array.from(colors).sort().map(color => ({ value: color, label: color })),
      sizes: Array.from(sizes).sort().map(size => ({ value: size, label: size })),
      materials: Array.from(materials).sort().map(material => ({ value: material, label: material })),
      brands: Array.from(brands).sort().map(brand => ({ value: brand, label: brand })),
      categories: Array.from(categories).sort().map(category => ({ value: category, label: category })),
      genders: Array.from(genders).sort().map(gender => ({ value: gender, label: gender })),
      seasons: Array.from(seasons).sort().map(season => ({ value: season, label: season })),
      skinTypes: Array.from(skinTypes).sort().map(skinType => ({ value: skinType, label: skinType })),
      purposes: Array.from(purposes).sort().map(purpose => ({ value: purpose, label: purpose })),
      priceRange: [Math.floor(minPrice), Math.ceil(maxPrice)] as [number, number]
    }
  }

  const filterOptions = extractFilterOptions()

  const getCategorySpecificFilters = () => {
    const categoryName = currentCategory?.name?.toLowerCase() || ''
    const categoryHandle = currentCategory?.handle?.toLowerCase() || ''
    
    const baseFilters = ['color', 'size']
    
    if (categoryName.includes('одежда') || categoryName.includes('fashion') || categoryHandle.includes('clothing')) {
      return [...baseFilters, 'brand', 'material', 'gender', 'season']
    }
    
    if (categoryName.includes('косметика') || categoryName.includes('beauty') || categoryHandle.includes('cosmetics')) {
      return [...baseFilters, 'brand', 'skinType', 'purpose']
    }
    
    if (categoryName.includes('электроника') || categoryName.includes('tech') || categoryHandle.includes('electronics')) {
      return [...baseFilters, 'brand']
    }
    
    if (categoryName.includes('дом') || categoryName.includes('home') || categoryHandle.includes('home')) {
      return [...baseFilters, 'brand', 'material']
    }
    
    return [...baseFilters, 'brand', 'material']
  }

  const availableFilters = getCategorySpecificFilters()

  const handleLocalFilterChange = (filterType: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters }
    
    if (filterType === 'priceRange' || filterType === 'hasDiscount' || filterType === 'inStock') {
      newFilters[filterType] = value
    } else {
      const currentValues = newFilters[filterType] as string[]
      if (currentValues.includes(value)) {
        newFilters[filterType] = currentValues.filter(v => v !== value) as any
      } else {
        newFilters[filterType] = [...currentValues, value] as any
      }
    }
    
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    setFilters(localFilters)
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      colors: [],
      sizes: [],
      materials: [],
      brands: [],
      priceRange: null,
      categories: [],
      hasDiscount: false,
      inStock: false,
      gender: [],
      season: [],
      skinType: [],
      purpose: []
    }
    setLocalFilters(emptyFilters)
  }

  const getFilteredProductsCount = () => {
    return products.filter(product => {
      if (localFilters.hasDiscount && !product.metadata?.has_discount) return false
      if (localFilters.inStock && product.variants?.every(v => (v.inventory_quantity || 0) <= 0)) return false
      
      if (localFilters.priceRange) {
        const [minPrice, maxPrice] = localFilters.priceRange
        const productPrice = product.variants?.[0]?.calculated_price?.calculated_amount
        if (!productPrice || productPrice < minPrice || productPrice > maxPrice) return false
      }
      
      if (localFilters.colors.length > 0) {
        const hasColor = product.variants?.some(variant =>
          variant.options?.some(option => {
            const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
            return (optionTitle?.includes('цвет') || optionTitle?.includes('color')) && 
                   localFilters.colors.includes(option.value)
          })
        )
        if (!hasColor) return false
      }
      
      if (localFilters.sizes.length > 0) {
        const hasSize = product.variants?.some(variant =>
          variant.options?.some(option => {
            const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
            return (optionTitle?.includes('размер') || optionTitle?.includes('size')) && 
                   localFilters.sizes.includes(option.value)
          })
        )
        if (!hasSize) return false
      }
      
      if (localFilters.brands.length > 0 && !localFilters.brands.includes(product.metadata?.brand as string)) return false
      if (localFilters.materials.length > 0 && !localFilters.materials.includes(product.material || '')) return false
      if (localFilters.gender.length > 0 && !localFilters.gender.includes(product.metadata?.gender as string)) return false
      if (localFilters.season.length > 0 && !localFilters.season.includes(product.metadata?.season as string)) return false
      if (localFilters.skinType.length > 0 && !localFilters.skinType.includes(product.metadata?.skin_type as string)) return false
      if (localFilters.purpose.length > 0 && !localFilters.purpose.includes(product.metadata?.purpose as string)) return false
      
      return true
    }).length
  }

  const hasActiveLocalFilters = Object.values(localFilters).some(filter => 
    Array.isArray(filter) ? filter.length > 0 : filter !== null && filter !== false
  )

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        count += value.length
      } else if (value !== null && value !== false) {
        count += 1
      }
    })
    return count
  }, [filters])

  const getFilteredOptions = (options: FilterOption[], sectionKey: string) => {
    const searchTerm = searchTerms[sectionKey]?.toLowerCase() || ''
    const filtered = searchTerm 
      ? options.filter(option => option.label.toLowerCase().includes(searchTerm))
      : options
    
    const showAll = showAllOptions[sectionKey]
    return showAll ? filtered : filtered.slice(0, 5)
  }

  const renderFilterSection = (
    key: string,
    title: string,
    options: FilterOption[],
    filterKey: keyof FilterState
  ) => {
    if (!availableFilters.includes(key) || options.length === 0) return null

    const filteredOptions = getFilteredOptions(options, key)
    const hasMore = options.length > 5 && !showAllOptions[key]
    const searchTerm = searchTerms[key] || ''

    return (
      <div key={key} className="mb-8">
        <button
          onClick={() => toggleSection(key)}
          className="flex items-center justify-between w-full text-left mb-4 group"
        >
          <span 
            className="font-medium text-gray-900 uppercase tracking-wide group-hover:text-[#C2E7DA] transition-colors"
            style={{ fontSize: '20px', fontWeight: 500 }}
          >
            {title}
          </span>
          <span className="text-gray-400">
            {expandedSections[key] ? '−' : '+'}
          </span>
        </button>
        
        {expandedSections[key] && (
          <div className="space-y-3">
            {options.length > 5 && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="найти"
                  value={searchTerm}
                  onChange={(e) => setSearchTerms(prev => ({ ...prev, [key]: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-black focus:border-black"
                />
              </div>
            )}
            
            {filteredOptions.map(option => (
              <label key={option.value} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(localFilters[filterKey] as string[]).includes(option.value)}
                  onChange={() => handleLocalFilterChange(filterKey, option.value)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                />
                <span 
                  className="ml-3 text-gray-700 group-hover:text-black transition-colors"
                  style={{ fontSize: '14px' }}
                >
                  {option.label}
                </span>
              </label>
            ))}
            
            {hasMore && (
              <button 
                onClick={() => setShowAllOptions(prev => ({ ...prev, [key]: true }))}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Показать всё
              </button>
            )}
            
            {showAllOptions[key] && options.length > 5 && (
              <button 
                onClick={() => setShowAllOptions(prev => ({ ...prev, [key]: false }))}
                className="text-sm text-gray-500 hover:text-black transition-colors"
              >
                Свернуть
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean, onChange: (checked: boolean) => void, label: string }) => (
    <div className="flex items-center justify-between">
      <span 
        className="text-gray-700"
        style={{ fontSize: '16px', fontWeight: 500 }}
      >
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
          checked ? 'bg-black' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  const PriceSlider = () => {
    const priceRange = filterOptions.priceRange || [0, 10000]
    const [minPrice, maxPrice] = priceRange
    const currentMin = localFilters.priceRange?.[0] || minPrice
    const currentMax = localFilters.priceRange?.[1] || maxPrice
    const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
    const sliderRef = React.useRef<HTMLDivElement>(null)

    const getValueFromPosition = (clientX: number) => {
      if (!sliderRef.current) return minPrice
      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      return minPrice + percentage * (maxPrice - minPrice)
    }

    const handleMouseDown = (e: React.MouseEvent, type: 'min' | 'max') => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(type)
    }

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return
      
      const newValue = getValueFromPosition(e.clientX)
      
      if (isDragging === 'min') {
        const value = Math.max(minPrice, Math.min(newValue, currentMax - 50))
        handleLocalFilterChange('priceRange', [Math.round(value), currentMax])
      } else {
        const value = Math.min(maxPrice, Math.max(newValue, currentMin + 50))
        handleLocalFilterChange('priceRange', [currentMin, Math.round(value)])
      }
    }, [isDragging, currentMin, currentMax, minPrice, maxPrice])

    const handleMouseUp = React.useCallback(() => {
      setIsDragging(null)
    }, [])

    React.useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = 'none'
        return () => {
          document.removeEventListener('mousemove', handleMouseMove)
          document.removeEventListener('mouseup', handleMouseUp)
          document.body.style.userSelect = ''
        }
      }
    }, [isDragging, handleMouseMove, handleMouseUp])

    const minPercentage = ((currentMin - minPrice) / (maxPrice - minPrice)) * 100
    const maxPercentage = ((currentMax - minPrice) / (maxPrice - minPrice)) * 100

    return (
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>от {currentMin} ₽</span>
          <span>до {currentMax} ₽</span>
        </div>
        <div 
          ref={sliderRef}
          className="relative h-6 flex items-center"
          style={{ userSelect: 'none' }}
        >
          <div className="absolute w-full h-1 bg-gray-200 rounded"></div>
          <div 
            className="absolute h-1 bg-black rounded pointer-events-none"
            style={{
              left: `${minPercentage}%`,
              right: `${100 - maxPercentage}%`
            }}
          ></div>
          
          <div
            className={`absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow-md transition-all duration-75 ${
              isDragging === 'min' ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105'
            }`}
            style={{
              left: `calc(${minPercentage}% - 10px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: isDragging === 'min' ? 3 : 2
            }}
            onMouseDown={(e) => handleMouseDown(e, 'min')}
          />
          
          <div
            className={`absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow-md transition-all duration-75 ${
              isDragging === 'max' ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105'
            }`}
            style={{
              left: `calc(${maxPercentage}% - 10px)`,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: isDragging === 'max' ? 3 : 1
            }}
            onMouseDown={(e) => handleMouseDown(e, 'max')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white ${className}`}>
      <style jsx>{`
        .range-slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #fff;
          cursor: grab;
          border: 2px solid #000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 3;
        }
        .range-slider::-webkit-slider-thumb:active {
          cursor: grabbing;
          background: #f5f5f5;
        }
        .range-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #fff;
          cursor: grab;
          border: 2px solid #000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .range-slider::-moz-range-thumb:active {
          cursor: grabbing;
          background: #f5f5f5;
        }
        .range-slider::-webkit-slider-track {
          background: transparent;
          border: none;
        }
        .range-slider::-moz-range-track {
          background: transparent;
          border: none;
        }
        .range-slider:focus {
          outline: none;
        }
        .price-slider-thumb {
          transition: background-color 0.2s ease;
        }
        .price-slider-thumb:hover {
          background-color: #f5f5f5;
        }
        .price-slider-thumb:active {
          background-color: #e5e5e5;
        }
      `}</style>
      
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-white focus:outline-none focus:ring-0 hover:text-[#C2E7DA] transition-colors"
        style={{
          fontSize: "16px",
          fontWeight: 500,
          lineHeight: 1.4,
          padding: "8px 12px",
          border: "none"
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Фильтры
        {activeFiltersCount > 0 && (
          <span className="bg-black text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[480px] bg-white overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6" style={{ paddingLeft: '80px', paddingBottom: '40px' }}>
              <h3 
                className="text-gray-900 tracking-wide"
                style={{ 
                  fontSize: '30px', 
                  fontWeight: 500, 
                  letterSpacing: '0.4px',
                  lineHeight: 1.1
                }}
              >
                фильтры
              </h3>
              <div className="flex items-center gap-4">
                {hasActiveLocalFilters && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-black transition-colors"
                  >
                    Очистить
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div style={{ padding: '0 50px 0 50px' }}>
              <div className="space-y-6 mb-8">
                <ToggleSwitch
                  checked={localFilters.hasDiscount}
                  onChange={(checked) => handleLocalFilterChange('hasDiscount', checked)}
                  label="Со скидкой"
                />
                
                <ToggleSwitch
                  checked={localFilters.inStock}
                  onChange={(checked) => handleLocalFilterChange('inStock', checked)}
                  label="В наличии"
                />
              </div>

              <PriceSlider />

              <div>
                {renderFilterSection('color', 'Цвет', filterOptions.colors || [], 'colors')}
                {renderFilterSection('size', 'Размер', filterOptions.sizes || [], 'sizes')}
                {renderFilterSection('brand', 'Бренд', filterOptions.brands || [], 'brands')}
                {renderFilterSection('material', 'Материал', filterOptions.materials || [], 'materials')}
                {renderFilterSection('gender', 'Пол', filterOptions.genders || [], 'gender')}
                {renderFilterSection('season', 'Сезон', filterOptions.seasons || [], 'season')}
                {renderFilterSection('skinType', 'Тип кожи', filterOptions.skinTypes || [], 'skinType')}
                {renderFilterSection('purpose', 'Назначение', filterOptions.purposes || [], 'purpose')}
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 w-[480px] bg-white border-t border-gray-100" style={{ padding: '20px 50px' }}>
              <Button 
                onClick={applyFilters} 
                className="w-full bg-black text-white py-4 rounded-none hover:bg-gray-800 transition-colors uppercase tracking-wide font-medium"
              >
                Показать {getFilteredProductsCount()} товаров
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductFilters 