'use client'

import { useState } from "react"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { Button } from "@medusajs/ui"

const PRODUCT_LIMIT = 16

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
}

export default function PaginatedProducts({
  sortBy,
  initialProducts,
  totalCount,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  region,
}: {
  sortBy?: SortOptions
  initialProducts: any[]
  totalCount: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  countryCode: string
  region: any
}) {
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(totalCount > PRODUCT_LIMIT)

  const loadMoreProducts = async () => {
    setIsLoading(true)
    const nextPage = page + 1
    
    const queryParams: PaginatedProductsParams = {
      limit: PRODUCT_LIMIT,
    }

    if (collectionId) {
      queryParams["collection_id"] = [collectionId]
    }

    if (categoryId) {
      queryParams["category_id"] = [categoryId]
    }

    if (productsIds) {
      queryParams["id"] = productsIds
    }

    if (sortBy === "created_at") {
      queryParams["order"] = "created_at"
    }

    try {
      const { response } = await listProductsWithSort({
        page: nextPage,
        queryParams,
        sortBy,
        countryCode,
      })
      
      setProducts([...products, ...response.products])
      setPage(nextPage)
      setHasMore(response.products.length === PRODUCT_LIMIT && products.length + response.products.length < totalCount)
    } catch (error) {
      console.error("Error loading more products:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-[1360px] mx-auto">
      <div className="overflow-hidden">
        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-16 gap-y-14 w-full justify-start">
            {products.slice(0, 8).map((p, index) => {
              const categoryTitle = p.type?.value || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
              return (
                <div key={p.id} className="flex justify-start">
                  <ProductPreview 
                    product={p} 
                    region={region} 
                    categoryTitle={categoryTitle} 
                  />
                </div>
              );
            })}
          </div>
        )}
        
        {products.length > 8 && (
          <>
            <div className="h-24"></div> {/* Larger space between rows 2 and 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-16 gap-y-14 w-full justify-start">
              {products.slice(8).map((p, index) => {
                const categoryTitle = p.type?.value || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
                return (
                  <div key={p.id} className="flex justify-start">
                    <ProductPreview 
                      product={p} 
                      region={region} 
                      categoryTitle={categoryTitle} 
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-16">
          <Button 
            variant="secondary" 
            className="w-full max-w-xs bg-black text-white uppercase hover:bg-black/80 py-4 text-sm font-medium"
            onClick={loadMoreProducts}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Показать еще
          </Button>
        </div>
      )}
    </div>
  )
}
