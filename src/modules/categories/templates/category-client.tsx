'use client'

import { Suspense, useState, useEffect, useRef } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import AllProductsDisplay from "@modules/store/components/all-products-display"
import Link from "next/link"
import ProductFilters, { FilterState } from "@modules/store/components/product-filters"
import { filterProducts } from "@lib/util/filter-products"
import { HttpTypes } from "@medusajs/types"
import SupportButton from "@modules/common/components/support-button"

const categoryColors = [
  "bg-[#F1FFE2]",
  "bg-gray-400", 
  "bg-[#6290C3]",
  "bg-[#1A1341]",
  "bg-[#BAFF29]",
  "bg-[#07c4f5]",
  "bg-[#ff6b6b]",
  "bg-[#50d890]",
]

interface CategoryClientProps {
  category: HttpTypes.StoreProductCategory
  countryCode: string
  products: HttpTypes.StoreProduct[]
  totalCount: number
  subcategories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  categoryIds: string[]
  allCategories: HttpTypes.StoreProductCategory[]
}

type SortOption = 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'rating'

// Функция для построения полной иерархии категорий
function buildCategoryHierarchy(
  category: HttpTypes.StoreProductCategory,
  allCategories: HttpTypes.StoreProductCategory[]
): HttpTypes.StoreProductCategory[] {
  const hierarchy: HttpTypes.StoreProductCategory[] = []
  let currentCategory: HttpTypes.StoreProductCategory | undefined = category
  
  while (currentCategory) {
    hierarchy.unshift(currentCategory)
    
    if (currentCategory.parent_category_id) {
      const parentCategory = allCategories.find(cat => cat.id === currentCategory!.parent_category_id)
      currentCategory = parentCategory
    } else {
      break
    }
  }
  
  return hierarchy
}

// Функция для сокращения хлебных крошек
function buildBreadcrumbs(categoryHierarchy: HttpTypes.StoreProductCategory[]) {
  const breadcrumbs = [
    { name: "Главная", path: "/" },
    { name: "Каталог", path: "/store" },
    ...categoryHierarchy.map(cat => ({
      name: cat.name,
      path: `/categories/${cat.handle}`
    }))
  ]
  
  if (breadcrumbs.length > 5) {
    return [
      breadcrumbs[0],
      { name: "...", path: "#" },
      ...breadcrumbs.slice(-2)
    ]
  }
  
  return breadcrumbs
}

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

export default function CategoryClient({
  category,
  countryCode,
  products,
  totalCount,
  subcategories,
  region,
  categoryIds,
  allCategories
}: CategoryClientProps) {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
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

  const containerRef = useRef<HTMLDivElement>(null)

  const sortOptions = [
    { value: 'newest', label: 'сначала новые' },
    { value: 'oldest', label: 'сначала старые' },
    { value: 'price_asc', label: 'по возрастанию цены' },
    { value: 'price_desc', label: 'по убыванию цены' },
    { value: 'rating', label: 'по рейтингу' }
  ]

  const getRandomSubcategories = (categories: HttpTypes.StoreProductCategory[], count: number) => {
    return categories.slice(0, count)
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
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1118);
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

  const categoryHierarchy = buildCategoryHierarchy(category, allCategories)
  const breadcrumbs = buildBreadcrumbs(categoryHierarchy)

  return (
    <>
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
              <span>{category.name}</span>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-8 left-6 z-10">
            <nav className="flex items-center space-x-2 text-white text-sm mb-4">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {crumb.path === "#" ? (
                    <span className="text-white/70">{crumb.name}</span>
                  ) : index === breadcrumbs.length - 1 ? (
                    <span>{crumb.name}</span>
                  ) : (
                    <Link 
                      href={crumb.path} 
                      className="hover:text-gray-400 transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </span>
              ))}
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
          {category.name}
        </h1>
      </div>

      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-200 py-6">
          <div className={isMobile || isTablet ? "" : "content-container"}>
            {isMobile || isTablet ? (
              <div 
                ref={containerRef}
                className="flex gap-2 overflow-x-auto hide-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {getRandomSubcategories(subcategories, 8).map((subcat, index) => (
                  <Link
                    key={subcat.id}
                    href={`/categories/${subcat.handle}`}
                    className="flex-shrink-0 px-2 rounded-lg font-medium transition-all duration-200 min-w-[70px] text-center text-xs flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-black"
                    style={{ height: '60px' }}
                  >
                    {subcat.name}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="flex gap-4">
                  {getRandomSubcategories(subcategories, 4).map((subcat, index) => (
                    <Link
                      key={subcat.id}
                      href={`/categories/${subcat.handle}`}
                      className="flex-shrink-0 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-[100px] text-center bg-gray-300 hover:bg-gray-400 text-black text-sm"
                    >
                      {subcat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`content-container py-8 pb-20 ${isMobile ? 'px-4' : ''}`}>
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
    </>
  )
} 
