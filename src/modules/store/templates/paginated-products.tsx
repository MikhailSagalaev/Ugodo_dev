'use client'

import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import { listProductsWithInventory } from "@lib/data/products"
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
  const [isMidTablet, setIsMidTablet] = useState(false)
  
  useEffect(() => {
    setProducts(initialProducts)
    setPage(1)
    setHasMore(totalCount > limit)
  }, [initialProducts, totalCount, limit])
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTabletOrMobile(width < 768);
      setIsTablet(width >= 768 && width < 1118);
      setIsMidTablet(width >= 1118 && width < 1233);
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
      <div className="w-full">
        <div className={`overflow-hidden flex justify-center ${!isTabletOrMobile ? 'px-4' : ''}`}>
          {products.length > 0 && (
            <div className={`
              grid 
              ${isTabletOrMobile ? 'grid-cols-2 gap-x-[30px] gap-y-[80px] max-w-[500px]' : 
                isTablet ? 'grid-cols-3 gap-x-[25px] gap-y-[70px] px-4 max-w-[750px]' : 
                isMidTablet ? 'grid-cols-4 gap-x-[15px] gap-y-[80px]' :
                'grid-cols-4 px-0'}
              ${isTabletOrMobile || isTablet ? '' : isMidTablet ? 'max-w-[980px]' : 'w-full'}
            justify-center
          `}
          style={!isTabletOrMobile && !isTablet && !isMidTablet ? { gap: 'clamp(18px, 2.5vw, 30px)' } : {}}
          >
            {products.map((p, index) => {
              const categoryTitle = p.type?.value || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
              return (
                <div key={p.id} className="flex justify-center">
                  <div 
                    className={`w-full aspect-[3/4] ${!isTabletOrMobile && !isTablet ? 'product-card-catalog' : ''}`}
                  >
                    <ProductPreview 
                      product={p} 
                      region={region} 
                      categoryTitle={categoryTitle}
                      firstInRow={
                        isTabletOrMobile ? index % 2 === 0 : 
                        isTablet ? index % 3 === 0 : 
                        isMidTablet ? index % 4 === 0 :
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
