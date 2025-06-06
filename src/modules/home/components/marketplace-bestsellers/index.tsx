'use client'

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import useEmblaCarousel from 'embla-carousel-react'

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
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      slidesToScroll: 1,
    }
  )

  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsTabletOrMobile(window.innerWidth <= 1025);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Группируем продукты по 4 для десктопа
  const itemsPerGroup = 4;
  const productGroups = []
  for (let i = 0; i < products.length; i += itemsPerGroup) {
    productGroups.push(products.slice(i, i + itemsPerGroup))
  }

  return (
    <section className="py-12 relative">
      <div className="content-container md:px-8 relative px-0">
        <div className="w-full max-w-[1360px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">{title.toLowerCase()}</h2>
          
          <div className="w-full mb-6">
            <LocalizedClientLink href="/bestsellers" className="relative block overflow-hidden rounded-md group h-full">
              <div className="relative w-full" style={{ height: '395px' }}>
                {isClient && (
                  <div className="w-full h-full relative overflow-hidden">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      disablePictureInPicture
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      style={{
                        minWidth: '100%',
                        minHeight: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center'
                      }}
                    >
                      <source src={isTabletOrMobile ? "/video/banners/3-mobile.mp4" : "/video/banners/3-pc.mp4"} type="video/mp4" />
                    </video>
                  </div>
                )}
                <div className="absolute inset-0  z-0"></div>
                <div className={`absolute inset-0 z-10 flex flex-col justify-center items-end ${isTabletOrMobile ? 'p-6' : 'p-8'}`}>
                  <div className="max-w-lg text-white text-right">
                    <h3 className={`${isTabletOrMobile ? 'text-2xl sm:text-3xl' : 'text-5xl'} font-bold mb-2 leading-tight`}>
                      Хиты продаж
                    </h3>
                    <p className={`mb-4 text-white/90 ${isTabletOrMobile ? 'text-sm' : 'text-lg'}`}>
                      {isTabletOrMobile ? 'Самые популярные товары с миллионами продаж на маркетплейсах' : 'Самые популярные товары с миллионами продаж на маркетплейсах'}
                    </p>
                    <div className={`inline-block bg-white hover:bg-gray-100 text-black ${isTabletOrMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-md font-medium transition-colors`}>
                      Смотреть все хиты
                    </div>
                  </div>
                </div>
              </div>
            </LocalizedClientLink>
          </div>
          
          {isTabletOrMobile ? (
            <div className="w-full flex flex-row overflow-x-auto pl-[10px] pr-[20px] scrollbar-hide" style={{ gap: 'clamp(24px, 3vw, 60px)' }}>
              {products.map((product, index) => {
                const categoryTitle = product.type?.value || 
                  (product.categories && product.categories.length > 0 ? 
                    product.categories[0].name : undefined);
                return (
                  <div key={product.id} className="flex-shrink-0 product-card-featured">
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
          ) : (
            <div className="relative">
              <button 
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center transition-colors hover:text-gray-500"
                aria-label="Предыдущие товары"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <button 
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center transition-colors hover:text-gray-500"
                aria-label="Следующие товары"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {productGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="flex-[0_0_100%] min-w-0">
                      <div className="flex justify-center px-0" style={{ gap: 'clamp(18px, 2.5vw, 30px)' }}>
                        {group.map((product) => {
                          const categoryTitle = product.type?.value || 
                            (product.categories && product.categories.length > 0 ? 
                              product.categories[0].name : undefined);
                          
                          return (
                            <div 
                              key={product.id} 
                              className="flex justify-center product-card-featured"
                            >
                              <ProductPreview 
                                product={product} 
                                region={region} 
                                categoryTitle={categoryTitle}
                                badgeType="hit"
                                textAlign="left"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 