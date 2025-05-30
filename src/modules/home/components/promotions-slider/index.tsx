'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from "next/image"
import useEmblaCarousel from 'embla-carousel-react'
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading, Text } from '@medusajs/ui'

// Данные для баннеров
const promotionBanners = [
  {
    id: 1,
    videoDesktop: "/video/banners/1-pc.mp4",
    videoMobile: "/video/banners/1-mobile.mp4",
    alt: "Большая Распродажа",
    headline: "Скидки до 70%",
    subheadline: "Ограниченное предложение на избранные товары",
    cta: "К покупкам",
    link: "/collections/sale"
  },
  {
    id: 2,
    videoDesktop: "/video/banners/2-pc.mp4",
    videoMobile: "/video/banners/2-mobile.mp4",
    alt: "Новая Коллекция",
    headline: "Стиль Сезона",
    subheadline: "Обновите гардероб с последними трендами",
    cta: "Смотреть",
    link: "/collections/new-arrivals"
  },
  {
    id: 3,
    videoDesktop: "/video/banners/3-pc.mp4",
    videoMobile: "/video/banners/3-mobile.mp4",
    alt: "Техника для Дома",
    headline: "Гаджеты и Аксессуары",
    subheadline: "Лучшие предложения на электронику и игровые девайсы",
    cta: "Выбрать",
    link: "/collections/electronics"
  }
]

const SLIDE_WIDTH = 990; // Banner width in pixels
const SLIDE_GAP = 90; // Gap between slides in pixels

const PromotionsSlider = () => {
  const [selectedIndex, setSelectedIndex] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({
      loop: true, 
    align: 'center',
    slidesToScroll: 1,
    startIndex: 1
  })

  useEffect(() => {
    setIsClient(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle slide change
  useEffect(() => {
    if (!emblaApi) return

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap())
    }

    emblaApi.on('select', onSelect)
    onSelect()

    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  return (
    <section className="py-12">
      <div className="content-container px-4 md:px-8 relative">
        <div className="w-full max-w-[1360px] mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Heading level="h2" className="text-2xl md:text-3xl font-bold uppercase">АКЦИИ И ПРЕДЛОЖЕНИЯ</Heading>
            
            {/* Навигационные стрелки */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => emblaApi?.scrollPrev()}
                className="w-10 h-10 flex items-center justify-center transition-colors hover:text-gray-500 border border-gray-300 rounded-full"
                aria-label="Предыдущий баннер"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                onClick={() => emblaApi?.scrollNext()}
                className="w-10 h-10 flex items-center justify-center transition-colors hover:text-gray-500 border border-gray-300 rounded-full"
                aria-label="Следующий баннер"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full relative overflow-hidden"> 
        <div className="overflow-hidden px-[45px]" ref={emblaRef}>
          <div className="flex">
          {promotionBanners.map((banner, index) => (
            <div 
              key={banner.id} 
                className="flex-none"
                style={{ width: `${SLIDE_WIDTH}px`, maxWidth: 'calc(100vw - 40px)', marginRight: `${SLIDE_GAP}px` }}
            >
                <LocalizedClientLink href={banner.link} className="relative block overflow-hidden rounded-md group">
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
                        <source src={isMobile ? banner.videoMobile : banner.videoDesktop} type="video/mp4" />
                      </video>
                    </div>
                  )}
                  <div className="absolute inset-0  z-0"></div>
                    <div className="absolute inset-0 z-10 flex flex-col justify-center items-center">
                      <div className="max-w-lg text-white text-center px-8">
                      <Heading level="h2" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3 leading-tight">
                        {banner.headline}
                      </Heading>
                      <Text size="large" className="mb-4 md:mb-6 text-white/90">
                        {banner.subheadline}
                      </Text>
                      <Button 
                        className="bg-white hover:bg-gray-100 text-black"
                        size="large"
                      >
                        {banner.cta}
                      </Button>
                      </div>
                  </div>
                </div>
               </LocalizedClientLink>
            </div>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}

export default PromotionsSlider 