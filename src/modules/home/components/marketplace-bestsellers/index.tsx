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
          <div className="w-full mb-6">
            <LocalizedClientLink href="/bestsellers" className="relative block overflow-hidden rounded-md group h-full">
              <div className="relative w-full mx-auto aspect-video" style={{ 
                maxWidth: isTabletOrMobile ? '100%' : '1260px'
              }}>
                {isClient && (
                  <div className="w-full h-full relative overflow-hidden">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      disablePictureInPicture
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
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
        </div>
      </div>
    </section>
  )
} 