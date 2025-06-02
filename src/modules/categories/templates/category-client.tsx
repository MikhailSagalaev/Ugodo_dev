'use client'

import { Suspense, useState, useEffect } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/templates/paginated-products"
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

  const categoryHierarchy = buildCategoryHierarchy(category, allCategories)
  const breadcrumbs = buildBreadcrumbs(categoryHierarchy)

  return (
    <>
      <div 
        className="relative w-full h-[415px] flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
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
                  <LocalizedClientLink 
                    href={crumb.path} 
                    className="hover:text-[#C2E7DA] transition-colors"
                  >
                    {crumb.name}
                  </LocalizedClientLink>
                )}
              </span>
            ))}
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

      {subcategories.length > 0 && (
        <div className="bg-white border-b border-gray-200 py-6">
          <div className="content-container">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {subcategories.map((subcat, index) => (
                <LocalizedClientLink
                  key={subcat.id}
                  href={`/categories/${subcat.handle}`}
                  className={`
                    flex-shrink-0 px-6 py-4 rounded-lg text-white font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg min-w-[120px] text-center
                    ${categoryColors[index % categoryColors.length]}
                  `}
                >
                  {subcat.name}
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
            <span className="text-lg font-medium text-gray-900">{totalCount} товаров</span>
          </div>
          
          <div></div>
        </div>
        
        <Suspense fallback={<SkeletonProductGrid />}>
          <PaginatedProducts
            initialProducts={filteredProducts}
            totalCount={totalCount}
            categoryIds={categoryIds}
            countryCode={countryCode}
            region={region}
          />
        </Suspense>
      </div>
    </>
  )
} 