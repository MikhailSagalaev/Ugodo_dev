'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from "next/image"
import { Button, Heading, Text, Container } from "@medusajs/ui"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

// Данные для слайдов (ЗАМЕНИТЬ НА ДИНАМИЧЕСКИЕ ДАННЫЕ)
const slides = [
  {
    id: 1,
    headline: "на товары для дома",
    title: "СКИДКА ДО 20%",
    image: "https://images.unsplash.com/photo-1558003173-716b214346b7?q=80&w=1932&auto=format&fit=crop",
    cta: {
      text: "Подробнее",
      link: "/collections/sale"
    }
  },
  {
    id: 2,
    headline: "новая коллекция",
    title: "ВЕСНА-ЛЕТО 2024",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=1868&auto=format&fit=crop",
    cta: {
      text: "Смотреть",
      link: "/collections/new-arrivals"
    }
  },
  {
    id: 3,
    headline: "только в этом месяце",
    title: "РАСПРОДАЖА",
    image: "https://images.unsplash.com/photo-1600611963263-819d90701b7a?q=80&w=1887&auto=format&fit=crop",
    cta: {
      text: "Перейти",
      link: "/collections/bathroom"
    }
  }
]

const Hero = () => {
  // Инициализируем Embla Carousel с плагином Autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, // Бесконечная прокрутка
      align: 'start' 
    },
    [
      Autoplay({ 
        delay: 5000, // Интервал автопрокрутки 5 сек
        stopOnInteraction: true, // Останавливать при взаимодействии пользователя
        stopOnMouseEnter: true, // Останавливать при наведении мыши
      })
    ]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  // Функции для навигации
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  // Обновление состояния при инициализации и реинициализации
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
      // Очистка слушателей при размонтировании
      emblaApi.off('reInit', onInit)
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onInit, onSelect])

  return (
    <div className="w-full relative overflow-hidden embla group"> {/* Добавляем embla и group */} 
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex"> {/* embla__container */} 
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className="flex-[0_0_100%] min-w-0 relative h-[75vh] md:h-[80vh]" /* embla__slide */ 
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
                <div className="container mx-auto py-16 md:py-24 px-4 sm:px-6 lg:px-8">
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
                        className="bg-[#cbf401] hover:bg-[#d8ff00] text-black min-w-32 h-12 px-6"
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

      {/* Кнопки навигации (появляются при наведении на group) */}
      <button
        className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={scrollPrev}
        disabled={!emblaApi?.canScrollPrev()}
        aria-label="Предыдущий слайд"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>
      
      <button
        className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center z-20 transition-opacity duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
        onClick={scrollNext}
        disabled={!emblaApi?.canScrollNext()}
        aria-label="Следующий слайд"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>

      {/* Индикаторы слайдов */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="flex gap-2 justify-center">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${index === selectedIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}`}
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
