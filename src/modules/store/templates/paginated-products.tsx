'use client'

import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import { listProductsWithInventory } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"

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
  categoryIds,
  productsIds,
  countryCode,
  region,
}: {
  initialProducts: any[]
  totalCount: number
  collectionId?: string
  categoryId?: string
  categoryIds?: string[]
  productsIds?: string[]
  countryCode: string
  region: any
}) {
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  
  const limit = categoryIds || categoryId ? 32 : PRODUCT_LIMIT
  const [hasMore, setHasMore] = useState(totalCount > limit)
  
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  
  useEffect(() => {
    setProducts(initialProducts)
    setPage(1)
    setHasMore(totalCount > limit)
  }, [initialProducts, totalCount, limit])
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTabletOrMobile(width < 824);
      setIsTablet(width >= 824 && width < 1024);
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
      limit: limit,
    }

    if (collectionId) {
      queryParams["collection_id"] = [collectionId]
    }

    if (categoryIds && categoryIds.length > 0) {
      queryParams["category_id"] = categoryIds
    } else if (categoryId) {
      queryParams["category_id"] = [categoryId]
    }

    if (productsIds) {
      queryParams["id"] = productsIds
    }

    try {
      const { response } = await listProductsWithInventory({
        pageParam: nextPage,
        queryParams: queryParams as HttpTypes.StoreProductParams,
        countryCode,
      })
      
      if (response.products.length > 0) {
        setProducts(prev => [...prev, ...response.products])
        setPage(nextPage)
        setHasMore(response.products.length === limit && products.length + response.products.length < totalCount)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
      setHasMore(false)
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
            ${isTabletOrMobile ? 'grid-cols-2 gap-x-[30px] gap-y-[80px]' : 
              isTablet ? 'grid-cols-3 gap-x-[25px] gap-y-[70px]' : 
              'grid-cols-4 px-16'}
            w-full
            justify-center
          `}
          style={!isTabletOrMobile && !isTablet ? { gap: 'clamp(15px, 2vw, 30px)' } : {}}
          >
            {products.map((p, index) => {
              const categoryTitle = p.type?.value || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
              return (
                <div key={p.id} className="flex justify-center">
                  <div 
                    className="w-full aspect-[3/4]"
                    style={!isTabletOrMobile && !isTablet ? { 
                      width: 'clamp(180px, calc(180px + (260 - 180) * ((100vw - 1120px) / (1920 - 1120))), 260px)'
                    } : {}}
                  >
                    <ProductPreview 
                      product={p} 
                      region={region} 
                      categoryTitle={categoryTitle}
                      firstInRow={
                        isTabletOrMobile ? index % 2 === 0 : 
                        isTablet ? index % 3 === 0 : 
                        false
                      }
                      textAlign="left"
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
