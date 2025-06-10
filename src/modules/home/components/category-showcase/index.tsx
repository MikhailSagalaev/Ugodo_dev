'use client'

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Heading } from "@medusajs/ui"

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
    <div style={{ backgroundColor: '#f3f4f6' }}>
      <section style={{ paddingTop: '16px', paddingBottom: '16px' }}>
        <div className="content-container md:px-8 relative px-0" style={{ backgroundColor: '#fdfdfd', borderRadius: '32px' }}>
        <div className="w-full max-w-[1360px] mx-auto">
          <div className="w-full mb-6">
            <LocalizedClientLink href="/collections/home-garden" className="relative block overflow-hidden group h-full max-w-[1415px] mx-auto" style={{ borderRadius: '48px', height: '433px' }}>
              <div className="relative w-full h-full">
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
                      <source src={isTabletOrMobile ? "/video/banners/2-mobile.mp4" : "/video/banners/2-pc.mp4"} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 z-0"></div>
                    <div className={`absolute inset-0 z-10 flex flex-col justify-center items-start ${isTabletOrMobile ? 'p-6' : 'p-8'}`}>
                      <div className="max-w-lg text-white">
                        <h3 className={`${isTabletOrMobile ? 'text-2xl sm:text-3xl' : 'text-5xl'} font-bold mb-2 leading-tight`}>
                          Дом и сад
                        </h3>
                        <p className={`mb-4 text-white/90 ${isTabletOrMobile ? 'text-sm' : 'text-lg'}`}>
                          {isTabletOrMobile ? 'Создайте уютное пространство для жизни с нашей коллекцией' : 'Создайте уютное пространство для жизни с нашей коллекцией товаров для дома и сада'}
                        </p>
                        <div className={`inline-block bg-white hover:bg-gray-100 text-black ${isTabletOrMobile ? 'px-4 py-2 text-sm' : 'px-6 py-3'} rounded-md font-medium transition-colors`}>
                          Смотреть все товары
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </LocalizedClientLink>
          </div>
        </div>
        </div>
      </section>
    </div>
  )
} 