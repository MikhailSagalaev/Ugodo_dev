'use client'

import { useState, useEffect } from "react"
import { Button } from "@medusajs/ui"
import { listProductsWithInventory } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
import { HttpTypes } from "@medusajs/types"

const PRODUCT_LIMIT = 15

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
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
  
  const limit = 15
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
      order: "-created_at"
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
      {isTabletOrMobile ? (
        <div className="w-full grid grid-cols-2 gap-x-[5px] gap-y-[20px] px-4">
          {products.map((product, index) => {
            const categoryTitle = product.type?.value || 
              (product.categories && product.categories.length > 0 ? 
                product.categories[0].name : undefined);
            
            return (
              <div 
                key={product.id} 
                className="w-full h-full"
              >
                <div className="product-card-compact w-full h-full">
                  <ProductPreview 
                    product={product} 
                    region={region} 
                    categoryTitle={categoryTitle}
                    textAlign="left"
                    firstInRow={index % 2 === 0}
                  />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div 
          className="w-full px-4"
          style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '12px'
          }}
        >
          {products.map((product, index) => {
            const categoryTitle = product.type?.value || 
              (product.categories && product.categories.length > 0 ? 
                product.categories[0].name : undefined);
            
            return (
              <div 
                key={product.id} 
                className="product-card-catalog"
              >
                <ProductPreview 
                  product={product} 
                  region={region} 
                  categoryTitle={categoryTitle}
                  textAlign="left"
                />
              </div>
            )
          })}
        </div>
      )}
      
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
