'use client'

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

type CategoryShowcaseProps = {
  title: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function CategoryShowcase({ 
  title, 
  products, 
  region
}: CategoryShowcaseProps) {
  const [topEmblaRef] = useEmblaCarousel(
    {
      align: 'start',
      loop: true,
      slidesToScroll: 1,
    }, 
    [
      Autoplay({ delay: 5000, stopOnInteraction: false })
    ]
  )

  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrMobile(window.innerWidth <= 1025);
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
          
          <div className={isTabletOrMobile ? "flex flex-col gap-2" : "flex flex-row gap-2"}>
            {isTabletOrMobile && (
              <div className="w-full order-1 mb-6">
                <LocalizedClientLink href="/collections/home-garden" className="relative block overflow-hidden rounded-md group h-full">
                  <div className="relative w-full aspect-[16/9]">
                    <Image 
                      src="/images/banners/banner.png" 
                      alt="Дом и сад"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      sizes="100vw"
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-0"></div>
                    <div className="absolute inset-0 z-10 flex flex-col justify-center items-start p-6">
                      <div className="max-w-lg text-white">
                        <h3 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight">
                          Дом и сад
                        </h3>
                        <p className="mb-4 text-white/90 text-sm">
                          Создайте уютное пространство для жизни с нашей коллекцией
                        </p>
                        <div className="inline-block bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-md font-medium transition-colors text-sm">
                          Смотреть коллекцию
                        </div>
                      </div>
                    </div>
                  </div>
                </LocalizedClientLink>
              </div>
            )}
            
            {isTabletOrMobile ? (
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
                          badgeType="none"
                          textAlign="left"
                          firstInRow={index === 0}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="w-1/4 flex flex-col gap-6 order-2">
                <div className="relative">
                  <div className="overflow-hidden h-full" ref={topEmblaRef}>
                    <div className="flex h-full">
                      {products.map((product) => {
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
                                badgeType="none"
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
            
            {!isTabletOrMobile && (
              <div className="w-3/4 order-1">
                <LocalizedClientLink href="/collections/home-garden" className="relative block overflow-hidden rounded-md group h-full">
                  <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
                    <Image 
                      src="/images/banners/banner.png" 
                      alt="Дом и сад"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-in-out"
                      sizes="800px"
                      quality={90}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-0"></div>
                    <div className="absolute inset-0 z-10 flex flex-col justify-center items-start p-8">
                      <div className="max-w-lg text-white">
                        <h3 className="text-5xl font-bold mb-3 leading-tight">
                          Дом и сад
                        </h3>
                        <p className="mb-6 text-white/90 text-lg">
                          Создайте уютное пространство для жизни с нашей коллекцией товаров для дома и сада
                        </p>
                        <div className="inline-block bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-md font-medium transition-colors">
                          Смотреть коллекцию
                        </div>
                      </div>
                    </div>
                  </div>
                </LocalizedClientLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
} 