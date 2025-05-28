'use client'

import { Suspense, useState } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "./paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductFilters, { FilterState } from "@modules/store/components/product-filters"
import { filterProducts } from "@lib/util/filter-products"
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

interface StoreClientProps {
  countryCode: string
  products: HttpTypes.StoreProduct[]
  totalCount: number
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
}

export default function StoreClient({
  countryCode,
  products,
  totalCount,
  categories,
  region
}: StoreClientProps) {
  const [filteredProducts, setFilteredProducts] = useState(products)
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    colors: [],
    sizes: [],
    materials: [],
    priceRange: null,
    categories: [],
    hasDiscount: false,
    inStock: false,
    expressDelivery: false
  })

  const handleFiltersChange = (filters: FilterState) => {
    setCurrentFilters(filters)
    const filtered = filterProducts(products, filters)
    setFilteredProducts(filtered)
  }

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
            <span>Каталог</span>
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
          КАТАЛОГ
        </h1>
      </div>

      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="content-container">
            <div className="flex justify-center">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                {categories.map((cat, index) => (
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
        </div>
      )}

      <div className="content-container py-8 pb-20">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ProductFilters
              products={products}
              onFiltersChange={handleFiltersChange}
            />
            
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="popular">по популярности</option>
              <option value="price_asc">по возрастанию цены</option>
              <option value="price_desc">по убыванию цены</option>
              <option value="newest">сначала новые</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <span className="text-lg font-medium text-gray-900">{filteredProducts.length} товаров</span>
          </div>
          
          <div></div>
        </div>
        
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            initialProducts={filteredProducts}
            totalCount={filteredProducts.length}
            countryCode={countryCode}
            region={region}
          />
        </Suspense>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#BAFF29] h-[45px] flex items-center justify-center z-40">
        <span 
          className="text-black"
          style={{ 
            fontSize: "14px",
            fontWeight: 500
          }}
        >
          дополнительная скидка -25% по промокоду ВМЕСТЕ
        </span>
      </div>
    </>
  )
} 