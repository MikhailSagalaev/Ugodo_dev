'use client'

import React, { useState, useEffect } from "react"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import ProductPreview from "../product-preview"

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
  const [currentSlide, setCurrentSlide] = useState(0)

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
          } else {
            setLoading(false)
            return
          }
        }
        
        queryParams.is_giftcard = false

        const { response } = await listProducts({
          queryParams: queryParams as HttpTypes.StoreProductParams,
          countryCode,
        })

        const filteredProducts = response.products.filter(
          (responseProduct) => responseProduct.id !== product.id
        )

        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error loading related products:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [product.id, countryCode, showAllProducts])

  const nextSlide = () => {
    const maxSlide = Math.max(0, products.length - 4)
    setCurrentSlide(prev => Math.min(prev + 1, maxSlide))
  }

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0))
  }

  if (loading) {
    return (
      <section className="py-6 md:py-8">
        <div className={`content-container ${isMobile ? 'px-0' : 'px-0 sm:px-4 md:px-8'} relative`}>
          <div className={`flex items-center justify-between mb-8 ${isMobile ? 'px-4' : 'px-4 sm:px-0'}`}>
            <Heading level="h2" className="text-2xl md:text-3xl font-bold lowercase">{title}</Heading>
          </div>
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8'}`}>
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
          
          {/* Стрелки для десктопа */}
          {!isMobile && products.length > 4 && (
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                disabled={currentSlide >= products.length - 4}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isMobile ? (
          <div className="w-full flex flex-row gap-5 overflow-x-auto pl-4 pr-4 scrollbar-hide">
            {products.slice(0, 8).map((product) => {
              const categoryTitle = product.type?.value || 
                (product.categories && product.categories.length > 0 ? 
                  product.categories[0].name : undefined);
              
              return (
                <div key={product.id} className="flex-shrink-0 w-[225px]">
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
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 25}%)` }}
            >
              {products.map((product) => {
                const categoryTitle = product.type?.value || 
                  (product.categories && product.categories.length > 0 ? 
                    product.categories[0].name : undefined);
                
                return (
                  <div key={product.id} className="w-1/4 flex-shrink-0 px-2">
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
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
