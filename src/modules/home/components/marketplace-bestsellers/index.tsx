'use client'

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

type MarketplaceBestsellersProps = {
  title: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function MarketplaceBestsellers({ 
  title, 
  products, 
  region
}: MarketplaceBestsellersProps) {
  // Create two separate carousels for top and bottom product rows with autoplay
  const [topEmblaRef] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      slidesToScroll: 1,
    }, 
    [
      Autoplay({ delay: 4500, stopOnInteraction: false })
    ]
  )
  
  const [bottomEmblaRef] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      slidesToScroll: 1,
    },
    [
      Autoplay({ delay: 5500, stopOnInteraction: false }) // Different delay to avoid synchronization
    ]
  )

  // Split products into two groups for top and bottom carousels
  // Use a deterministic approach to avoid hydration errors
  const halfPoint = Math.floor(products.length / 2)
  const topProducts = products.slice(0, halfPoint)
  const bottomProducts = products.slice(halfPoint)

  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="py-12 relative">
      <div className="content-container md:px-8 relative px-0">
        <div className="w-full max-w-[1360px] mx-auto">
          {/* Название по центру */}
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{title.toLowerCase()}</h2>
          
          <div className="flex flex-col md:flex-row gap-2">
            {isTabletOrMobile && (
              <div className="w-full order-1 mb-6 block md:hidden">
                <LocalizedClientLink href="/collections/bestsellers" className="relative block overflow-hidden rounded-md group h-full">
                  <div className="relative w-full aspect-[16/9]">
                    <Image 
                      src="/images/banners/banner.png" 
                      alt="Хиты продаж"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      sizes="100vw"
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent z-0"></div>
                    <div className="absolute inset-0 z-10 flex flex-col justify-center items-end p-6">
                      <div className="max-w-lg text-white text-right">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
                          Хиты продаж
                        </h3>
                        <p className="mb-4 text-white/90 text-sm">
                          Самые популярные товары с миллионами продаж на маркетплейсах
                        </p>
                        <div className="inline-block bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-md font-medium transition-colors text-sm">
                          Смотреть все хиты
                        </div>
                      </div>
                    </div>
                  </div>
                </LocalizedClientLink>
              </div>
            )}
            {isTabletOrMobile ? (
              <>
                {/* Слайдер товаров внизу для мобильной версии */}
                <div className="w-full flex flex-row gap-5 overflow-x-auto pl-[10px] pr-[20px] order-2 scrollbar-hide">
                  {products.map((product, index) => {
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
                            badgeType="hit"
                            textAlign="left"
                            firstInRow={index === 0}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-6 order-2 md:order-1">
                {/* Верхняя карусель */}
                <div className="relative h-1/2">
                  <div className="overflow-hidden h-full" ref={topEmblaRef}>
                    <div className="flex h-full">
                      {topProducts.map((product) => {
                        const categoryTitle = product.type?.value || 
                          (product.categories && product.categories.length > 0 ? 
                            product.categories[0].name : undefined);
                        return (
                          <div 
                            key={product.id} 
                            className="flex-shrink-0 w-full"
                          >
                            <div className="bg-white rounded-md overflow-hidden h-full">
                              <ProductPreview 
                                product={product} 
                                region={region} 
                                categoryTitle={categoryTitle}
                                badgeType="hit"
                                textAlign="left"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Нижняя карусель */}
                <div className="relative h-1/2">
                  <div className="overflow-hidden h-full" ref={bottomEmblaRef}>
                    <div className="flex h-full">
                      {bottomProducts.map((product) => {
                        const categoryTitle = product.type?.value || 
                          (product.categories && product.categories.length > 0 ? 
                            product.categories[0].name : undefined);
                        return (
                          <div 
                            key={product.id} 
                            className="flex-shrink-0 w-full"
                          >
                            <div className="bg-white rounded-md overflow-hidden h-full">
                              <ProductPreview 
                                product={product} 
                                region={region} 
                                categoryTitle={categoryTitle}
                                badgeType="hit"
                                textAlign="left"
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Баннер справа (только для десктопа и планшета) */}
            <div className="w-full md:w-2/3 lg:w-3/4 order-1 md:order-2 hidden md:block">
              <LocalizedClientLink href="/collections/bestsellers" className="relative block overflow-hidden rounded-md group h-full">
                <div className="relative w-full aspect-[3/4]">
                  <Image 
                    src="/images/banners/banner.png"
                    alt="Хиты продаж"
                    fill
                    priority
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    sizes="(max-width: 768px) 100vw, 800px"
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent z-0"></div>
                  <div className="absolute inset-0 z-10 flex flex-col justify-center items-end p-8 md:p-12">
                    <div className="max-w-lg text-white text-right">
                      <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3 leading-tight">
                        Хиты продаж
                      </h3>
                      <p className="mb-4 md:mb-6 text-white/90 text-lg">
                        Самые популярные товары с миллионами продаж на маркетплейсах
                      </p>
                      <div className="inline-block bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-md font-medium transition-colors">
                        Смотреть все хиты
                      </div>
                    </div>
                  </div>
                </div>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 