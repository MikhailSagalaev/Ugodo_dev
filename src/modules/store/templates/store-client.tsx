'use client'

import { Suspense, useState, useEffect, useRef } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import AllProductsDisplay from "../components/all-products-display"
import Link from "next/link"
import ProductFilters, { FilterState } from "@modules/store/components/product-filters"
import SupportButton from "@modules/common/components/support-button"
import { filterProducts } from "@lib/util/filter-products"
import { HttpTypes } from "@medusajs/types"

const categoryColors = [
  "bg-[#F1FFE2]",
          "bg-[#C2E7DA]", 
  "bg-[#6290C3]",
  "bg-[#1A1341]",
  "bg-[#BAFF29]",
  "bg-[#07c4f5]",
  "bg-[#ff6b6b]",
  "bg-[#50d890]",
]

interface StoreClientProps {
  countryCode: string
  products: HttpTypes.StoreProduct[]
  totalCount: number
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
}

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating'

function sortProducts(products: HttpTypes.StoreProduct[], sortBy: SortOption): HttpTypes.StoreProduct[] {
  const sorted = [...products]
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
    
    case 'oldest':
      return sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateA - dateB
      })
    
    case 'price_asc':
      return sorted.sort((a, b) => {
        const priceA = a.variants?.[0]?.calculated_price?.calculated_amount || 0
        const priceB = b.variants?.[0]?.calculated_price?.calculated_amount || 0
        return priceA - priceB
      })
    
    case 'price_desc':
      return sorted.sort((a, b) => {
        const priceA = a.variants?.[0]?.calculated_price?.calculated_amount || 0
        const priceB = b.variants?.[0]?.calculated_price?.calculated_amount || 0
        return priceB - priceA
      })
    
    case 'rating':
      return sorted.sort((a, b) => {
        const ratingA = parseFloat(a.metadata?.rating as string || '0')
        const ratingB = parseFloat(b.metadata?.rating as string || '0')
        return ratingB - ratingA
      })
    
    default:
      return sorted
  }
}

export default function StoreClient({
  countryCode,
  products,
  totalCount,
  categories,
  region
}: StoreClientProps) {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
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

  const containerRef = useRef<HTMLDivElement>(null)

  const sortOptions = [
    { value: 'newest', label: 'сначала новые' },
    { value: 'oldest', label: 'сначала старые' },
    { value: 'price_asc', label: 'по возрастанию цены' },
    { value: 'price_desc', label: 'по убыванию цены' },
    { value: 'rating', label: 'по рейтингу' }
  ]

  const getRandomCategories = (categories: HttpTypes.StoreProductCategory[], count: number, isClient: boolean) => {
    if (!isClient) {
      return categories.slice(0, count)
    }
    const shuffled = [...categories].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  const handleWheelScroll = (e: WheelEvent) => {
    const container = containerRef.current
    if (container && container.scrollWidth > container.clientWidth) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.5) {
        e.preventDefault()
        container.scrollLeft += e.deltaX * 1 
      }
    }
  }

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters)
    const filtered = filterProducts(products, filters)
    const sorted = sortProducts(filtered, sortBy)
    setFilteredProducts(sorted)
  }

  const handleSortChange = (newSortBy: SortOption) => {
    setSortBy(newSortBy)
    setIsDropdownOpen(false)
    const filtered = filterProducts(products, currentFilters)
    const sorted = sortProducts(filtered, newSortBy)
    setFilteredProducts(sorted)
  }

  useEffect(() => {
    setIsClient(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const filtered = filterProducts(products, currentFilters)
    const sorted = sortProducts(filtered, sortBy)
    setFilteredProducts(sorted)
  }, [products, currentFilters, sortBy])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.sort-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    container.addEventListener('wheel', handleWheelScroll, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', handleWheelScroll)
    }
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f3f4f6' }}>
      <div 
        className={`relative w-full flex items-center justify-center`}
        style={{
          height: isMobile ? '165px' : '415px',
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {isMobile ? (
          <div className="absolute top-4 left-4 z-10">
            <div className="flex items-center space-x-2 text-white text-sm">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center hover:text-gray-400 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span>Каталог</span>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-8 left-6 z-10">
            <nav className="flex items-center space-x-2 text-white text-sm mb-4">
              <Link href="/" className="hover:text-gray-400 transition-colors">
                Главная
              </Link>
              <span>/</span>
              <span>Каталог</span>
            </nav>
          </div>
        )}
        
        <h1 
          className="relative z-10 text-white text-center"
          style={{
            fontSize: isMobile ? "35px" : "60px",
            fontWeight: 500,
            letterSpacing: isMobile ? "-0.4px" : "-0.2px",
            lineHeight: isMobile ? 1.1 : 1
          }}
        >
          КАТАЛОГ
        </h1>
      </div>

      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-200 py-6">
          <div className={isMobile ? "" : "content-container"}>
            {isMobile ? (
              <div 
                ref={containerRef}
                className="flex gap-2 overflow-x-auto hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {getRandomCategories(categories, 8, isClient).map((cat, index) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.handle}`}
                    className="flex-shrink-0 px-2 rounded-lg font-medium transition-all duration-200 min-w-[70px] text-center text-xs flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-black"
                    style={{ height: '60px' }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="flex gap-4">
                  {getRandomCategories(categories, 4, isClient).map((cat, index) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.handle}`}
                      className="flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-[100px] text-center bg-gray-300 hover:bg-gray-400 text-black text-sm"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#f3f4f6' }}>
        <section style={{ paddingTop: '16px', paddingBottom: '16px' }}>
          <div className="content-container px-0 sm:px-4 md:px-8 relative" style={{ backgroundColor: '#f8f9fa', borderRadius: '32px' }}>
            <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-0" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
              <div className="mb-6 flex justify-between items-center">
                {isMobile ? (
                  <>
                    <div className="flex items-center gap-4">
                      <ProductFilters
                        products={products}
                        onFiltersChange={handleFiltersChange}
                        isMobile={true}
                        sortBy={sortBy}
                        onSortChange={(newSort) => handleSortChange(newSort as SortOption)}
                      />
                    </div>
                    
                    <div className="flex-1 text-center">
                      <span 
                        className="text-gray-900 font-medium"
                        style={{ fontSize: "15px" }}
                      >
                        {filteredProducts.length} товаров
                      </span>
                    </div>
                    
                    <div></div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <ProductFilters
                        products={products}
                        onFiltersChange={handleFiltersChange}
                      />
                      
                      <div className="relative sort-dropdown">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center justify-between bg-white focus:outline-none focus:ring-0 hover:text-gray-400 transition-colors text-base font-medium py-2 px-3 pr-8 border-none min-w-[200px]"
                        >
                          <span>{sortOptions.find(opt => opt.value === sortBy)?.label}</span>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {isDropdownOpen && (
                          <div className="absolute z-50 mt-1 w-[200px] left-0 top-full">
                            <div className="bg-white border border-gray-200 rounded-md shadow-lg">
                              <ul className="py-1">
                                {sortOptions.map((option) => (
                                  <li key={option.value}>
                                    <button
                                      className={`w-full text-left px-4 py-2 text-sm hover:text-gray-400 transition-colors ${
                                        sortBy === option.value ? 'font-medium' : ''
                                      }`}
                                      onClick={() => handleSortChange(option.value as SortOption)}
                                    >
                                      {option.label}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                      <span className="text-gray-900 text-base font-medium">
                        {filteredProducts.length} товаров
                      </span>
                    </div>
                    
                    <div></div>
                  </>
                )}
              </div>
              
              <Suspense fallback={<SkeletonProductGrid />}>
                <AllProductsDisplay
                  products={filteredProducts}
                  region={region}
                />
              </Suspense>
            </div>
          </div>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#BAFF29] h-[45px] flex items-center justify-center z-40">
        <span 
          className="text-black"
          style={{ 
            fontSize: isMobile ? "11px" : "14px",
            fontWeight: 500
          }}
        >
          дополнительная скидка -25% по промокоду ВМЕСТЕ
        </span>
      </div>
      
      <SupportButton />
    </div>
  )
} 
