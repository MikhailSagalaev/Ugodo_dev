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
  const [progressBars, setProgressBars] = useState<JSX.Element[]>([]); // Для хранения элементов прогресс-баров

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
     // Перезапускаем анимацию прогресс-бара при каждом выборе слайда
     setProgressBars(createProgressBars(emblaApi.scrollSnapList().length, emblaApi.selectedScrollSnap(), autoplayDelay));
  }, [autoplayDelay]) // Добавляем autoplayDelay в зависимости

   // Функция для создания прогресс-баров с анимацией
   const createProgressBars = (count: number, currentIndex: number, duration: number): JSX.Element[] => {
    return Array.from({ length: count }).map((_, index) => {
      let progressWidth = '0%';
      let animationClass = '';
      let animationDur = '0ms';

      if (index < currentIndex) {
        progressWidth = '100%';
      } else if (index === currentIndex) {
        animationClass = 'animate-progress';
        animationDur = `${duration}ms`;
        // Ширина будет управляться анимацией
      } 
      // Для index > currentIndex ширина остается '0%'

      return (
        <div 
          key={index} 
          className="flex-1 h-1 bg-white/30 overflow-hidden rounded-full cursor-pointer" 
          onClick={() => scrollTo(index)} 
          aria-label={`Перейти к слайду ${index + 1}`}
        >
          <div 
            key={`${index}-${currentIndex}`} // Оставляем динамический ключ для сброса состояния
            className={`h-full bg-white rounded-full ${animationClass}`}
            style={{
              // Устанавливаем ширину для неактивных слайдов
              width: index !== currentIndex ? progressWidth : undefined,
              animationDuration: animationDur,
            }}
          ></div>
        </div>
      );
    });
  };

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)

     // Инициализируем прогресс-бары при монтировании
     setProgressBars(createProgressBars(emblaApi.scrollSnapList().length, emblaApi.selectedScrollSnap(), autoplayDelay));

    return () => {
      emblaApi.off('reInit', onInit)
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onInit, onSelect, autoplayDelay]) // Добавляем autoplayDelay

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

      {/* Новые индикаторы слайдов (прогресс-бары) */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Обертка для прогресс-баров с отступами */}
          <div className="flex gap-3 justify-center max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
            {progressBars} {/* Отображаем созданные прогресс-бары */} 
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
