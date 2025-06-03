'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@medusajs/ui'
import noUiSlider from 'nouislider'
import 'nouislider/dist/nouislider.css'

declare global {
  interface HTMLElement {
    noUiSlider?: any
  }
}

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

  const [filters, setFilters] = useState<FilterState>(emptyFilters)
  const [localFilters, setLocalFilters] = useState<FilterState>(emptyFilters)
  const [isInitialized, setIsInitialized] = useState(false)

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

  const getDynamicPriceRange = React.useMemo(() => {
    const filtersWithoutPrice = { ...localFilters, priceRange: null }
    const filteredProducts = products.filter(product => {
      if (filtersWithoutPrice.hasDiscount && !product.metadata?.has_discount) return false
      if (filtersWithoutPrice.inStock && product.variants?.every(v => (v.inventory_quantity || 0) <= 0)) return false
      
      if (filtersWithoutPrice.colors.length > 0) {
        const hasColor = product.variants?.some(variant =>
          variant.options?.some(option => {
            const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
            return (optionTitle?.includes('цвет') || optionTitle?.includes('color')) && 
                   filtersWithoutPrice.colors.includes(option.value)
          })
        )
        if (!hasColor) return false
      }
      
      if (filtersWithoutPrice.sizes.length > 0) {
        const hasSize = product.variants?.some(variant =>
          variant.options?.some(option => {
            const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
            return (optionTitle?.includes('размер') || optionTitle?.includes('size')) && 
                   filtersWithoutPrice.sizes.includes(option.value)
          })
        )
        if (!hasSize) return false
      }
      
      if (filtersWithoutPrice.brands.length > 0 && !filtersWithoutPrice.brands.includes(product.metadata?.brand as string)) return false
      if (filtersWithoutPrice.materials.length > 0 && !filtersWithoutPrice.materials.includes(product.material || '')) return false
      if (filtersWithoutPrice.gender.length > 0 && !filtersWithoutPrice.gender.includes(product.metadata?.gender as string)) return false
      if (filtersWithoutPrice.season.length > 0 && !filtersWithoutPrice.season.includes(product.metadata?.season as string)) return false
      if (filtersWithoutPrice.skinType.length > 0 && !filtersWithoutPrice.skinType.includes(product.metadata?.skin_type as string)) return false
      if (filtersWithoutPrice.purpose.length > 0 && !filtersWithoutPrice.purpose.includes(product.metadata?.purpose as string)) return false
      
      return true
    })

    const prices: number[] = []
    filteredProducts.forEach(product => {
      product.variants?.forEach(variant => {
        const priceAmount = variant.calculated_price?.calculated_amount
        if (priceAmount && priceAmount > 0) {
          prices.push(typeof priceAmount === 'string' ? parseFloat(priceAmount) : priceAmount)
        }
      })
    })

    if (prices.length === 0) {
      return [0, 10000] as [number, number]
    }

    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    return [Math.floor(minPrice), Math.ceil(maxPrice)] as [number, number]
  }, [localFilters.colors, localFilters.sizes, localFilters.brands, localFilters.materials, localFilters.gender, localFilters.season, localFilters.skinType, localFilters.purpose, localFilters.hasDiscount, localFilters.inStock, products])

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
    
    if (filterType === 'priceRange') {
      newFilters[filterType] = value
    } else if (filterType === 'hasDiscount' || filterType === 'inStock') {
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
    
    setShowAllOptions({})
    setSearchTerms({})
  }

  const getFilteredProductsCount = () => {
    const hasActiveFilters = localFilters.colors.length > 0 || 
                            localFilters.sizes.length > 0 || 
                            localFilters.brands.length > 0 || 
                            localFilters.materials.length > 0 || 
                            localFilters.gender.length > 0 || 
                            localFilters.season.length > 0 || 
                            localFilters.skinType.length > 0 || 
                            localFilters.purpose.length > 0 || 
                            localFilters.hasDiscount || 
                            localFilters.inStock ||
                            localFilters.priceRange

    if (!hasActiveFilters) {
      return products.length
    }

    const filteredProducts = products.filter(product => {
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
    })

    return filteredProducts.length
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

    const availableValues = getAvailableOptions(filterKey)
    const filteredOptions = getFilteredOptions(options, key)
    const hasMore = options.length > 5 && !showAllOptions[key]
    const searchTerm = searchTerms[key] || ''

    return (
      <div key={key} className="mb-8">
        <button
          onClick={() => toggleSection(key)}
          className="flex items-center justify-between w-full text-left mb-4 group"
        >
          <div className="flex items-center gap-3">
            <span className="text-gray-400">
              {expandedSections[key] ? '−' : '+'}
            </span>
            <span 
              className="font-medium text-gray-900 uppercase tracking-wide group-hover:text-[#C2E7DA] transition-colors"
              style={{ fontSize: '20px', fontWeight: 500 }}
            >
              {title}
            </span>
          </div>
        </button>
        
        {expandedSections[key] && (
          <div className="space-y-3">
            {options.length > 5 && showAllOptions[key] && (
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
            
            {filteredOptions.map(option => {
              const isAvailable = availableValues.includes(option.value)
              const isSelected = ((localFilters[filterKey] as string[]) || []).includes(option.value)
              
              return (
                <label key={option.value} className={`flex items-center cursor-pointer group ${!isAvailable && !isSelected ? 'opacity-40' : ''}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={!isAvailable && !isSelected}
                    onChange={() => handleLocalFilterChange(filterKey, option.value)}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2 disabled:opacity-50"
                  />
                  <span 
                    className={`ml-3 transition-colors ${
                      !isAvailable && !isSelected 
                        ? 'text-gray-400' 
                        : 'text-gray-700 group-hover:text-black'
                    }`}
                    style={{ fontSize: '14px' }}
                  >
                    {option.label}
                  </span>
                </label>
              )
            })}
            
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
    const dynamicPriceRange = getDynamicPriceRange
    const [minPrice, maxPrice] = dynamicPriceRange
    const currentMin = localFilters.priceRange?.[0] ?? minPrice
    const currentMax = localFilters.priceRange?.[1] ?? maxPrice
    const sliderRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!sliderRef.current) return

      if (sliderRef.current.noUiSlider) {
        sliderRef.current.noUiSlider.destroy()
      }

      noUiSlider.create(sliderRef.current, {
        start: [currentMin, currentMax],
        connect: true,
        range: {
          min: minPrice,
          max: maxPrice
        },
        step: 1,
        format: {
          to: (value: number) => Math.round(value),
          from: (value: string) => Number(value)
        }
      })

      const target = sliderRef.current
      if (target) {
        target.style.background = '#e5e7eb'
        target.style.border = 'none'
        target.style.boxShadow = 'none'
        target.style.height = '2px'
        target.style.borderRadius = '0'
      }

      sliderRef.current.noUiSlider.on('slide', (values: string[]) => {
        const min = Number(values[0])
        const max = Number(values[1])
        handleLocalFilterChange('priceRange', [min, max])
      })

      sliderRef.current.noUiSlider.on('set', (values: string[]) => {
        const min = Number(values[0])
        const max = Number(values[1])
        handleLocalFilterChange('priceRange', [min, max])
      })

      return () => {
        if (sliderRef.current?.noUiSlider) {
          sliderRef.current.noUiSlider.destroy()
        }
      }
    }, [minPrice, maxPrice, currentMin, currentMax])

    return (
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-4">
          <span>от {currentMin} ₽</span>
          <span>до {currentMax} ₽</span>
        </div>
        <div className="px-2">
          <div ref={sliderRef} className="price-slider" />
        </div>
        <style jsx>{`
          .price-slider :global(.noUi-target) {
            background: #e5e7eb !important;
            border: none !important;
            box-shadow: none !important;
            height: 2px !important;
            border-radius: 0 !important;
          }
          .price-slider :global(.noUi-base) {
            height: 2px !important;
          }
          .price-slider :global(.noUi-connects) {
            height: 2px !important;
          }
          .price-slider :global(.noUi-connect) {
            background: #000 !important;
            height: 2px !important;
          }
          .price-slider :global(.noUi-origin) {
            height: 2px !important;
          }
          .price-slider :global(.noUi-handle) {
            background: #fff !important;
            border: 2px solid #000 !important;
            border-radius: 50% !important;
            box-shadow: none !important;
            width: 20px !important;
            height: 20px !important;
            top: -9px !important;
            right: -10px !important;
            cursor: pointer !important;
          }
          .price-slider :global(.noUi-handle:before),
          .price-slider :global(.noUi-handle:after) {
            display: none !important;
          }
          .price-slider :global(.noUi-touch-area) {
            height: 20px !important;
            width: 20px !important;
          }
        `}</style>
      </div>
    )
  }

  const getAvailableOptions = (filterType: keyof FilterState) => {
    const filtersWithoutCurrent = { ...localFilters }
    
    if (Array.isArray(filtersWithoutCurrent[filterType])) {
      filtersWithoutCurrent[filterType] = [] as any
    }
    
    const availableProducts = products.filter(product => {
      if (filtersWithoutCurrent.hasDiscount && !product.metadata?.has_discount) return false
      if (filtersWithoutCurrent.inStock && product.variants?.every(v => (v.inventory_quantity || 0) <= 0)) return false
      
      if (filtersWithoutCurrent.priceRange) {
        const [minPrice, maxPrice] = filtersWithoutCurrent.priceRange
        const productPrice = product.variants?.[0]?.calculated_price?.calculated_amount
        if (!productPrice || productPrice < minPrice || productPrice > maxPrice) return false
      }
      
      if (filtersWithoutCurrent.colors.length > 0) {
        const hasColor = product.variants?.some(variant =>
          variant.options?.some(option => {
            const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
            return (optionTitle?.includes('цвет') || optionTitle?.includes('color')) && 
                   filtersWithoutCurrent.colors.includes(option.value)
          })
        )
        if (!hasColor) return false
      }
      
      if (filtersWithoutCurrent.sizes.length > 0) {
        const hasSize = product.variants?.some(variant =>
          variant.options?.some(option => {
            const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
            return (optionTitle?.includes('размер') || optionTitle?.includes('size')) && 
                   filtersWithoutCurrent.sizes.includes(option.value)
          })
        )
        if (!hasSize) return false
      }
      
      if (filtersWithoutCurrent.brands.length > 0 && !filtersWithoutCurrent.brands.includes(product.metadata?.brand as string)) return false
      if (filtersWithoutCurrent.materials.length > 0 && !filtersWithoutCurrent.materials.includes(product.material || '')) return false
      if (filtersWithoutCurrent.gender.length > 0 && !filtersWithoutCurrent.gender.includes(product.metadata?.gender as string)) return false
      if (filtersWithoutCurrent.season.length > 0 && !filtersWithoutCurrent.season.includes(product.metadata?.season as string)) return false
      if (filtersWithoutCurrent.skinType.length > 0 && !filtersWithoutCurrent.skinType.includes(product.metadata?.skin_type as string)) return false
      if (filtersWithoutCurrent.purpose.length > 0 && !filtersWithoutCurrent.purpose.includes(product.metadata?.purpose as string)) return false
      
      return true
    })

    const availableValues = new Set<string>()
    
    availableProducts.forEach(product => {
      if (filterType === 'colors') {
        product.variants?.forEach(variant => {
          variant.options?.forEach(option => {
            const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
            if (optionTitle?.includes('цвет') || optionTitle?.includes('color')) {
              availableValues.add(option.value)
            }
          })
        })
      } else if (filterType === 'sizes') {
        product.variants?.forEach(variant => {
          variant.options?.forEach(option => {
            const optionTitle = product.options?.find(opt => opt.id === option.option_id)?.title?.toLowerCase()
            if (optionTitle?.includes('размер') || optionTitle?.includes('size')) {
              availableValues.add(option.value)
            }
          })
        })
      } else if (filterType === 'brands' && product.metadata?.brand) {
        availableValues.add(product.metadata.brand as string)
      } else if (filterType === 'materials' && product.material) {
        availableValues.add(product.material)
      } else if (filterType === 'gender' && product.metadata?.gender) {
        availableValues.add(product.metadata.gender as string)
      } else if (filterType === 'season' && product.metadata?.season) {
        availableValues.add(product.metadata.season as string)
      } else if (filterType === 'skinType' && product.metadata?.skin_type) {
        availableValues.add(product.metadata.skin_type as string)
      } else if (filterType === 'purpose' && product.metadata?.purpose) {
        availableValues.add(product.metadata.purpose as string)
      }
    })

    return Array.from(availableValues)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const categoryKey = currentCategory?.handle || 'all'
      localStorage.setItem(`productFilters_${categoryKey}`, JSON.stringify(filters))
    }
  }, [filters, currentCategory?.handle])

  useEffect(() => {
    if (!isInitialized) {
      const categoryKey = currentCategory?.handle || 'all'
      const saved = localStorage.getItem(`productFilters_${categoryKey}`)
      if (saved) {
        try {
          const savedFilters = JSON.parse(saved)
          setFilters(savedFilters)
          setLocalFilters(savedFilters)
          onFiltersChange(savedFilters)
        } catch (e) {
          console.error('Error parsing saved filters:', e)
        }
      }
      setIsInitialized(true)
    }
  }, [currentCategory?.handle, isInitialized, onFiltersChange])

  useEffect(() => {
    if (isInitialized) {
      setFilters(emptyFilters)
      setLocalFilters(emptyFilters)
      onFiltersChange(emptyFilters)
    }
  }, [currentCategory?.handle])

  return (
    <div className={`bg-white ${className}`}>
      <button
        onClick={() => {
          setLocalFilters(filters)
          setIsOpen(true)
        }}
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