'use client'

import { useState, useEffect } from "react"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Button } from "@medusajs/ui"

const PRODUCT_LIMIT = 16

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
}

export default function PaginatedProducts({
  initialProducts,
  totalCount,
  collectionId,
  categoryId,
  productsIds,
  countryCode,
  region,
}: {
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
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false)
  
  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

    try {
      const { response } = await listProducts({
        pageParam: nextPage,
    queryParams,
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
    <div className="w-full max-w-[1360px] mx-auto px-0">
      <div className="overflow-hidden">
        {products.length > 0 && (
          <div className={`
            grid
            ${isTabletOrMobile ? 'grid-cols-2 gap-x-[20px] gap-y-[60px]' : 'grid-cols-4 gap-x-8 gap-y-12'}
            w-full
            justify-start
          `}>
            {products.map((p, index) => {
              const categoryTitle = p.type?.value || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
              return (
                <div key={p.id} className={`flex ${isTabletOrMobile ? 'justify-center' : 'justify-start'}`}>
                  <div className="w-full aspect-[3/4]">
                    <ProductPreview 
                      product={p} 
                      region={region} 
                      categoryTitle={categoryTitle}
                      firstInRow={isTabletOrMobile && index % 2 === 0}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-16">
          <Button 
            variant="secondary" 
            className="w-full max-w-xs bg-[#1A1341] text-white uppercase hover:bg-black/80 py-4 text-sm font-medium"
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
