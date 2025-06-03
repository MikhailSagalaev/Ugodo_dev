'use client'

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { listProductsWithInventory } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { Heading } from "@medusajs/ui"
import ProductPreview from "../product-preview"
import useEmblaCarousel from 'embla-carousel-react'

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
  title?: string
  showAllProducts?: boolean
}

export default function RelatedProducts({
  product,
  countryCode,
  title = "похожие товары",
  showAllProducts = false
}: RelatedProductsProps) {
  const [products, setProducts] = useState<HttpTypes.StoreProduct[]>([])
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  })

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      try {
        const regionData = await getRegion(countryCode)
        if (!regionData) {
          setLoading(false)
          return
        }
        setRegion(regionData)

        let queryParams: Record<string, any> = {}
        
        if (regionData?.id) {
          queryParams.region_id = regionData.id
        }
        
        if (!showAllProducts) {
          if (product.categories && product.categories.length > 0) {
            queryParams.category_id = product.categories.map(cat => cat.id)
            queryParams.limit = 100
          } else {
            setLoading(false)
            return
          }
        } else {
          queryParams.limit = 32
        }
        
        queryParams.is_giftcard = false

        const { response } = await listProductsWithInventory({
          queryParams: queryParams as HttpTypes.StoreProductParams,
          countryCode,
        })

        let filteredProducts = response.products.filter(
          (responseProduct) => responseProduct.id !== product.id
        )

        if (showAllProducts && filteredProducts.length > 0) {
          const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random())
          filteredProducts = shuffled.slice(0, 16)
        }

        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error loading related products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [product.id, countryCode, showAllProducts])

  const itemsPerGroup = 4;
  const productGroups = []
  for (let i = 0; i < products.length; i += itemsPerGroup) {
    productGroups.push(products.slice(i, i + itemsPerGroup))
  }

  if (loading) {
    return (
      <section className="py-6 md:py-8">
        <div className={`content-container ${isMobile ? 'px-0' : 'px-0 sm:px-4 md:px-8'} relative`}>
          <div className={`flex items-center justify-between mb-8 ${isMobile ? 'px-4' : 'px-4 sm:px-0'}`}>
            <Heading level="h2" className="text-2xl md:text-3xl font-bold lowercase">{title}</Heading>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-4 gap-6'}`}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full aspect-[3/4] bg-gray-200 animate-pulse rounded"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products.length || !region) {
    return null
  }

  return (
    <section className="py-6 md:py-8">
      <div className={`content-container ${isMobile ? 'px-0' : 'px-0 sm:px-4 md:px-8'} relative`}>
        <div className={`flex items-center justify-between mb-8 ${isMobile ? 'px-4' : 'px-4 sm:px-0'}`}>
          <Heading level="h2" className="text-2xl md:text-3xl font-bold lowercase">{title}</Heading>
          
          {!isMobile && products.length > 4 && (
            <div className="flex gap-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isMobile ? (
          <div className="w-full flex flex-row overflow-x-auto pl-4 pr-4 scrollbar-hide" style={{ gap: 'clamp(24px, 3vw, 60px)' }}>
            {products.slice(0, 8).map((product) => {
              const categoryTitle = product.type?.value || 
                (product.categories && product.categories.length > 0 ? 
                  product.categories[0].name : undefined);
              
              return (
                <div key={product.id} className="flex-shrink-0" style={{ width: 'clamp(180px, calc(180px + (260 - 180) * ((100vw - 1120px) / (1920 - 1120))), 260px)' }}>
                  <div className="aspect-[3/4] w-full">
                    <ProductPreview 
                      product={product} 
                      region={region} 
                      categoryTitle={categoryTitle}
                      badgeType="none"
                      textAlign="left"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {productGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="flex-[0_0_100%] min-w-0">
                    <div className="grid grid-cols-4 gap-6">
                      {group.map((product) => {
                        const categoryTitle = product.type?.value || 
                          (product.categories && product.categories.length > 0 ? 
                            product.categories[0].name : undefined);
                        
                        return (
                          <div key={product.id} className="w-full">
                            <ProductPreview 
                              product={product} 
                              region={region} 
                              categoryTitle={categoryTitle}
                              badgeType="none"
                              textAlign="left"
                            />
                          </div>
                        )
                      })}
                      {group.length < 4 && Array.from({ length: 4 - group.length }).map((_, emptyIndex) => (
                        <div key={`empty-${groupIndex}-${emptyIndex}`} className="w-full"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
