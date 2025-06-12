"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"

import ProductFilters, { FilterState } from "@modules/store/components/product-filters"
import AllProductsDisplay from "@modules/store/components/all-products-display"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import { filterProducts } from "@lib/util/filter-products"
import { CategoryTopBanner } from "@modules/banner/components"

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

interface BestsellersClientProps {
  countryCode: string
  products: HttpTypes.StoreProduct[]
  totalCount: number
  region: HttpTypes.StoreRegion
}

export default function BestsellersClient({
  countryCode,
  products,
  totalCount,
  region
}: BestsellersClientProps) {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
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

  const sortOptions = [
    { value: 'rating', label: 'по рейтингу' },
    { value: 'newest', label: 'сначала новые' },
    { value: 'oldest', label: 'сначала старые' },
    { value: 'price_asc', label: 'по возрастанию цены' },
    { value: 'price_desc', label: 'по убыванию цены' }
  ]

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024
      setIsMobile(mobile)
      setIsTablet(tablet)
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

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort)
    setIsDropdownOpen(false)
  }

  return (
    <>
      <CategoryTopBanner 
        className="w-full"
        isMobile={isMobile}
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
                <span className="ml-1">Назад</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="absolute top-6 left-6 z-10">
            <nav className="flex items-center space-x-2 text-white text-sm">
              <span>Главная</span>
              <span>/</span>
              <span className="text-gray-300">Хиты продаж</span>
            </nav>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center text-center text-white">
          <h1 
            className={`font-bold uppercase mb-2 ${
              isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'
            }`}
          >
            Хиты продаж
          </h1>
          <p 
            className={`text-white/90 max-w-2xl ${
              isMobile ? 'text-sm px-4' : 'text-lg'
            }`}
          >
            Самые популярные товары в нашем магазине
          </p>
        </div>
      </CategoryTopBanner>

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
                    <div className="flex items-center gap-6">
                      <ProductFilters
                        products={products}
                        onFiltersChange={handleFiltersChange}
                        isMobile={false}
                      />
                      
                      <div className="relative">
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="flex items-center gap-2 text-gray-900 hover:text-gray-600 transition-colors"
                          style={{ fontSize: "15px" }}
                        >
                          <span>
                            {sortOptions.find(option => option.value === sortBy)?.label || 'по рейтингу'}
                          </span>
                          <svg 
                            width="12" 
                            height="12" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor"
                            className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
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
    </>
  )
} 