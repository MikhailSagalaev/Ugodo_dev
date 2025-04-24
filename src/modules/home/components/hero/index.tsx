'use client'

import { Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

// Данные для слайдов
const slides = [
  {
    id: 1,
    title: "Скидка до 30%",
    description: "Откройте для себя коллекцию высококачественных товаров для дома, созданных с любовью к деталям и заботой о вашем комфорте",
    image: "/placeholder.svg", // Используем заглушку вместо отсутствующих изображений
    cta: {
      text: "Смотреть каталог",
      link: "/collections/sale"
    },
    bgColor: "from-lime-500/5 to-green-500/5"
  },
  {
    id: 2,
    title: "Новая коллекция",
    description: "Эксклюзивные новинки для вашего дома. Создайте уютное пространство с нашими стильными решениями",
    image: "/placeholder.svg", // Используем заглушку вместо отсутствующих изображений
    cta: {
      text: "Подробнее",
      link: "/collections/new-arrivals"
    },
    bgColor: "from-blue-500/5 to-purple-500/5"
  },
  {
    id: 3,
    title: "Товары для ванной",
    description: "Превратите вашу ванную комнату в спа-салон с нашей коллекцией премиальных товаров",
    image: "/placeholder.svg", // Используем заглушку вместо отсутствующих изображений
    cta: {
      text: "Перейти",
      link: "/collections/bathroom"
    },
    bgColor: "from-cyan-500/5 to-blue-500/5"
  }
]

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isFading, setIsFading] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Минимальное расстояние свайпа для смены слайда
  const minSwipeDistance = 50

  // Автоматическое переключение слайдов
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        changeSlide((prev) => (prev + 1) % slides.length)
      }, 5000) // Переключение каждые 5 секунд
    }
    
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [isAutoPlaying])

  // Функция для смены слайда с анимацией
  const changeSlide = useCallback((getNextIndex: (current: number) => number) => {
    setIsFading(true)
    setTimeout(() => {
      setCurrentSlide(getNextIndex(currentSlide))
      setIsFading(false)
    }, 300) // Время анимации затухания
  }, [currentSlide])

  // Обработчики для свайпов на мобильных устройствах
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    if (isLeftSwipe) {
      nextSlide()
    }
    
    if (isRightSwipe) {
      prevSlide()
    }
    
    // Сбрасываем значения
    setTouchStart(0)
    setTouchEnd(0)
  }

  // Приостанавливаем автопрокрутку при наведении
  const pauseAutoPlay = useCallback(() => setIsAutoPlaying(false), [])
  const resumeAutoPlay = useCallback(() => setIsAutoPlaying(true), [])

  // Переключение на конкретный слайд
  const goToSlide = useCallback((index: number) => {
    if (index === currentSlide) return
    
    changeSlide(() => index)
    setIsAutoPlaying(false)
    
    // Возобновляем автопрокрутку через 10 секунд после последнего ручного переключения
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
    }
    
    autoPlayTimerRef.current = setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [currentSlide, changeSlide])

  // Кнопки для навигации по слайдам
  const prevSlide = useCallback(() => {
    changeSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    
    // Возобновляем автопрокрутку через 8 секунд
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
    }
    
    autoPlayTimerRef.current = setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [changeSlide])

  const nextSlide = useCallback(() => {
    changeSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    
    // Возобновляем автопрокрутку через 8 секунд
    if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current)
    }
    
    autoPlayTimerRef.current = setTimeout(() => setIsAutoPlaying(true), 8000)
  }, [changeSlide])

  const slide = slides[currentSlide]

  return (
    <div 
      className={`w-full bg-gradient-to-r ${slide.bgColor} relative overflow-hidden transition-colors duration-500`}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="content-container py-12 md:py-16 lg:py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className={`max-w-xl transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-ui-fg-base">
              {slide.title}
            </h1>
            <p className="text-gray-600 mb-8 text-base md:text-lg">
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-4">
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
          <div className={`relative w-full max-w-md lg:max-w-lg xl:max-w-xl aspect-[4/5] rounded-2xl overflow-hidden border border-ui-border-base shadow-lg transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            {/* Заглушка для изображения */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#f3f3f3]">
              <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Баннер {currentSlide + 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Индикаторы слайдов */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? "bg-[#cbf401] w-8" : "bg-gray-300 w-2.5"
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`Перейти к слайду ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Кнопки навигации по слайдам */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 flex items-center justify-center z-10 shadow-md hover:bg-white transition-colors"
        onClick={prevSlide}
        aria-label="Предыдущий слайд"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 flex items-center justify-center z-10 shadow-md hover:bg-white transition-colors"
        onClick={nextSlide}
        aria-label="Следующий слайд"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      
      {/* Декоративные элементы */}
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-green-400/10 rounded-full blur-3xl"></div>
    </div>
  )
}

export default Hero
