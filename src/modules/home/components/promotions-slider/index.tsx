'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from "next/image"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading, Text } from '@medusajs/ui'

// Новые данные для баннеров (примеры)
const promotionBanners = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1974&auto=format&fit=crop",
    alt: "Большая Распродажа",
    headline: "Скидки до 70%",
    subheadline: "Ограниченное предложение на избранные товары",
    cta: "К покупкам",
    link: "/collections/sale"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    alt: "Новая Коллекция",
    headline: "Стиль Сезона",
    subheadline: "Обновите гардероб с последними трендами",
    cta: "Смотреть",
    link: "/collections/new-arrivals"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
    alt: "Техника для Дома",
    headline: "Гаджеты и Аксессуары",
    subheadline: "Лучшие предложения на электронику и игровые девайсы",
    cta: "Выбрать",
    link: "/collections/electronics"
  }
]

const PromotionsSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'center'
    },
    [Autoplay({ delay: 7000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi, setSelectedIndex])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <div className="w-full relative overflow-hidden embla mb-8 md:mb-12 lg:mb-16"> 
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {promotionBanners.map((banner, index) => (
            <div 
              key={banner.id} 
              className="flex-[0_0_90%] md:flex-[0_0_85%] lg:flex-[0_0_100%] min-w-0 relative aspect-[16/9] md:aspect-[16/8] lg:h-[70vh] pl-4"
            >
              <LocalizedClientLink href={banner.link} className="relative block h-full overflow-hidden group">
                  <Image 
                    src={banner.image} 
                    alt={banner.alt}
                    fill
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="object-cover object-center brightness-75 -z-10 group-hover:scale-105 transition-transform duration-300 ease-in-out"
                    sizes="100vw"
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-0"></div>
                  <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-8 md:p-10 lg:p-12">
                    <div className="max-w-lg text-white">
                      <Heading level="h2" className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3 leading-tight">
                        {banner.headline}
                      </Heading>
                      <Text size="large" className="mb-4 md:mb-6 text-white/90">
                        {banner.subheadline}
                      </Text>
                      <Button 
                        className="bg-white hover:bg-gray-100 text-black rounded-none border-none"
                        size="large"
                      >
                        {banner.cta}
                      </Button>
                  </div>
                </div>
               </LocalizedClientLink>
            </div>
          ))}
        </div>
      </div>
      {/* Dots navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {promotionBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full ${selectedIndex === index ? 'bg-white' : 'bg-white/50'} transition-colors duration-200`}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default PromotionsSlider 