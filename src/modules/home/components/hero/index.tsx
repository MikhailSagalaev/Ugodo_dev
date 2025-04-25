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
    headline: "на товары для дома",
    title: "СКИДКА ДО 20%",
    image: "/images/banners/placeholder.svg", // Используем заглушку вместо отсутствующих изображений
    cta: {
      text: "Подробнее",
      link: "/collections/sale"
    }
  },
  {
    id: 2,
    headline: "новая коллекция",
    title: "ВЕСНА-ЛЕТО 2024",
    image: "/images/banners/placeholder.svg", // Используем заглушку вместо отсутствующих изображений
    cta: {
      text: "Смотреть",
      link: "/collections/new-arrivals"
    }
  },
  {
    id: 3,
    headline: "только в этом месяце",
    title: "РАСПРОДАЖА",
    image: "/images/banners/placeholder.svg", // Используем заглушку вместо отсутствующих изображений
    cta: {
      text: "Перейти",
      link: "/collections/bathroom"
    }
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

  // Функция для смены слайда с анимацией
  const changeSlide = useCallback((getNextIndex: (current: number) => number) => {
    setIsFading(true)
    setTimeout(() => {
      setCurrentSlide(getNextIndex(currentSlide))
      setIsFading(false)
    }, 300) // Время анимации затухания
  }, [currentSlide])

  // Автоматическое переключение слайдов
  useEffect(() => {
    // Очищаем существующий таймер при изменении состояния
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current)
      autoPlayTimerRef.current = null
    }
    
    // Создаем новый таймер если автовоспроизведение включено
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        changeSlide((prev) => (prev + 1) % slides.length)
      }, 5000) // Переключение каждые 5 секунд
    }
    
    // Очистка при размонтировании
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current)
        autoPlayTimerRef.current = null
      }
    }
  }, [isAutoPlaying, changeSlide])

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
      className="w-full h-[75vh] md:h-[80vh] relative overflow-hidden"
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Фоновое изображение на всю ширину */}
      <div className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <Image 
          src={slide.image} 
          alt={slide.title}
          fill
          priority
          className="object-cover object-center brightness-75"
          sizes="100vw"
        />
        {/* Затемнение для лучшей читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
      </div>
      
      {/* Контент поверх изображения */}
      <div className="relative z-10 h-full flex items-center">
        <div className="content-container">
          <div className={`max-w-md transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-white/90 text-lg md:text-xl mb-2 font-light tracking-wide">
              {slide.headline}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight tracking-wide">
              {slide.title}
            </h1>
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
        </div>
      </div>
      
      {/* Индикаторы слайдов (центрированные) */}
      <div className="absolute bottom-8 left-0 right-0 z-10">
        <div className="content-container flex justify-center">
          <div className="flex gap-3 justify-center">
            {slides.map((_, index) => (
              <button
                key={index}
                className="focus:outline-none"
                onClick={() => goToSlide(index)}
                aria-label={`Перейти к слайду ${index + 1}`}
              >
                <div className="relative h-[3px] w-16 bg-white/30 overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full bg-white transition-all duration-500 ease-in-out ${
                      currentSlide === index 
                        ? 'w-full animate-progress-bar' 
                        : index < currentSlide 
                          ? 'w-full opacity-50' 
                          : 'w-0'
                    }`}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Кнопки навигации слайдера (по бокам) */}
      <button
        className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-200"
        onClick={prevSlide}
        aria-label="Предыдущий слайд"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>
      
      <button
        className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-200"
        onClick={nextSlide}
        aria-label="Следующий слайд"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </button>
      
      {/* Добавляем keyframes для анимации */}
      <style jsx global>{`
        @keyframes progress-bar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-progress-bar {
          animation: progress-bar 5s linear;
        }
      `}</style>
    </div>
  )
}

export default Hero
