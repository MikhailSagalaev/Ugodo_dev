'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from "next/image"
import { Button, Heading, Text, Container } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

// Данные для слайдов (ЗАМЕНИТЬ НА ДИНАМИЧЕСКИЕ ДАННЫЕ)
const slides = [
  {
    id: 1,
    headline: "на товары для дома",
    title: "СКИДКА ДО 20%",
    image: "/images/hero/доставка бирюза 2.png",
    cta: {
      text: "Подробнее",
      link: "/collections/sale"
    }
  },
  {
    id: 2,
    headline: "новая коллекция",
    title: "ВЕСНА-ЛЕТО 2024",
    image: "/images/hero/Frame 1984077837 (1).jpg",
    cta: {
      text: "Смотреть",
      link: "/collections/new-arrivals"
    }
  },
  {
    id: 3,
    headline: "только в этом месяце",
    title: "РАСПРОДАЖА",
    image: "/images/hero/девушка с коробкой 1.png",
    cta: {
      text: "Перейти",
      link: "/collections/bathroom"
    }
  }
]

const Hero = () => {
  const autoplayDelay = 10000; // 10 секунд
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start' 
    },
    [
      Autoplay({ 
        delay: autoplayDelay, // Используем переменную для задержки
        stopOnInteraction: false, // Продолжать автопрокрутку после взаимодействия
        stopOnMouseEnter: false, // НЕ останавливать при наведении мыши
      })
    ]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('reInit', onInit)
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onInit, onSelect])

  return (
    <div className="w-full relative overflow-hidden embla"> 
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex"> 
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className="flex-[0_0_100%] min-w-0 relative h-[75vh] md:h-[80vh]" 
            >
              {/* Фоновое изображение */}
              <Image 
                src={slide.image} 
                alt={slide.title}
                fill
                priority={slide.id === 1} // Приоритет для первого слайда
                loading={slide.id === 1 ? "eager" : "lazy"}
                className="object-cover object-center brightness-75 -z-10"
                sizes="100vw"
                quality={90}
              />
              {/* Затемнение */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-0"></div>
              
              {/* Контент */}
              <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto pt-32 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8">
                  <div className="max-w-md">
                    <Text className="text-white/90 text-lg md:text-xl mb-2 font-light tracking-wide">
                      {slide.headline}
                    </Text>
                    <Heading 
                      level="h1" 
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight tracking-tight"
                    >
                      {slide.title}
                    </Heading>
                    <LocalizedClientLink href={slide.cta.link}>
                      <Button 
                        className="bg-black hover:bg-gray-800 text-white min-w-32 h-12 px-6"
                        size="large"
                      >
                        {slide.cta.text}
                      </Button>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-1">
            {scrollSnaps.map((_, index) => (
              <div
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-200 
                  ${index === selectedIndex 
                    ? 'bg-black' 
                    : 'bg-white border border-black hover:bg-gray-300'}`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
