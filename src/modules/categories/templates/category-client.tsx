'use client'

import { Suspense, useState } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FiltersModal from "../components/filters-modal"
import { HttpTypes } from "@medusajs/types"

const categoryColors = [
  "bg-[#1A1341]",
  "bg-[#07c4f5]", 
  "bg-[#C2E7DA]",
  "bg-[#BAFF29]",
  "bg-[#ff6b6b]",
  "bg-[#4ecdc4]",
  "bg-[#9b59b6]",
  "bg-[#f39c12]",
]

interface CategoryClientProps {
  category: HttpTypes.StoreProductCategory
  countryCode: string
  products: HttpTypes.StoreProduct[]
  totalCount: number
  otherCategories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
}

export default function CategoryClient({
  category,
  countryCode,
  products,
  totalCount,
  otherCategories,
  region
}: CategoryClientProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  return (
    <>
      <div 
        className="relative w-full h-[415px] flex items-end justify-center pb-8"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="absolute bottom-8 left-6 z-10">
          <nav className="flex items-center space-x-2 text-white text-sm mb-4">
            <LocalizedClientLink href="/" className="hover:text-[#C2E7DA] transition-colors">
              Главная
            </LocalizedClientLink>
            <span>/</span>
            <LocalizedClientLink href="/store" className="hover:text-[#C2E7DA] transition-colors">
              Каталог
            </LocalizedClientLink>
            <span>/</span>
            <span>{category.name}</span>
          </nav>
        </div>
        
        <h1 
          className="relative z-10 text-white text-center"
          style={{
            fontSize: "60px",
            fontWeight: 500,
            letterSpacing: "-0.2px",
            lineHeight: 1
          }}
        >
          {category.name}
        </h1>
      </div>

      {otherCategories.length > 0 && (
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="content-container">
            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
              {otherCategories.map((cat, index) => (
                <LocalizedClientLink
                  key={cat.id}
                  href={`/categories/${cat.handle}`}
                  className={`
                    flex-shrink-0 px-6 py-4 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-[120px] text-center
                    ${categoryColors[index % categoryColors.length]}
                  `}
                >
                  {cat.name}
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="content-container py-8">
        {category.description && (
          <div className="mb-8 text-center">
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">{category.description}</p>
          </div>
        )}
        
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setIsFiltersOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 7h10M3 12h4m4-9h4"/>
              </svg>
              фильтры
            </button>
            
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="popular">по популярности</option>
              <option value="price_asc">по возрастанию цены</option>
              <option value="price_desc">по убыванию цены</option>
              <option value="newest">сначала новые</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <span className="text-lg font-medium text-gray-900">{totalCount} товаров</span>
          </div>
          
          <div></div>
        </div>
        
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            initialProducts={products}
            totalCount={totalCount}
            categoryId={category.id}
            countryCode={countryCode}
            region={region}
          />
        </Suspense>
      </div>

      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        totalProducts={totalCount}
      />
    </>
  )
} 