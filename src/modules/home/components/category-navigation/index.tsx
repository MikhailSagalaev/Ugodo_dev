'use client'

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X } from "@medusajs/icons"
import Modal from "@modules/common/components/modal"

// Данные для сторис
const stories = [
  {
    id: "story_1",
    title: "Ванная",
    color: "#07c4f5", // голубой
    bgColor: "bg-[#07c4f5]",
    textColor: "text-white",
    handle: "bathroom-design",
    image: "/images/stories/bathroom.jpg",
    content: [
      {
        id: "step_1",
        title: "Коллекция для ванной",
        description: "Создайте стильную и функциональную ванную комнату с нашей новой коллекцией",
        image: "/images/stories/bathroom-1.jpg",
        cta: { text: "Смотреть", url: "/collections/bathroom" }
      },
      {
        id: "step_2",
        title: "Аксессуары",
        description: "Дополните интерьер стильными аксессуарами для вашей ванной",
        image: "/images/stories/bathroom-2.jpg",
        cta: { text: "Подробнее", url: "/collections/bathroom-accessories" }
      }
    ]
  },
  {
    id: "story_2",
    title: "Весна 2024",
    color: "#cbf401", // салатовый
    bgColor: "bg-[#cbf401]",
    textColor: "text-black",
    handle: "spring-collection",
    image: "/images/stories/spring.jpg",
    content: [
      {
        id: "step_1",
        title: "Весенняя коллекция",
        description: "Свежие идеи для вашего дома в новом сезоне",
        image: "/images/stories/spring-1.jpg",
        cta: { text: "Перейти", url: "/collections/spring-2024" }
      }
    ]
  },
  {
    id: "story_3",
    title: "Новинки",
    color: "#ffffff", // белый
    bgColor: "bg-white",
    textColor: "text-black",
    handle: "new-arrivals",
    image: "/images/stories/new.jpg",
    content: [
      {
        id: "step_1",
        title: "Новые поступления",
        description: "Только что прибывшие товары в нашем магазине",
        image: "/images/stories/new-1.jpg",
        cta: { text: "Смотреть все", url: "/collections/new-arrivals" }
      }
    ]
  },
  {
    id: "story_4",
    title: "Для кухни",
    color: "#ff6b6b", // красный
    bgColor: "bg-[#ff6b6b]",
    textColor: "text-white",
    handle: "kitchen-essentials",
    image: "/images/stories/kitchen.jpg",
    content: [
      {
        id: "step_1",
        title: "Кухонные принадлежности",
        description: "Все необходимое для комфортного приготовления пищи",
        image: "/images/stories/kitchen-1.jpg",
        cta: { text: "Подробнее", url: "/collections/kitchen" }
      }
    ]
  },
  {
    id: "story_5",
    title: "Экология",
    color: "#50d890", // зеленый
    bgColor: "bg-[#50d890]",
    textColor: "text-white",
    handle: "eco-friendly",
    image: "/images/stories/eco.jpg",
    content: [
      {
        id: "step_1",
        title: "Эко-товары",
        description: "Забота о планете начинается дома",
        image: "/images/stories/eco-1.jpg",
        cta: { text: "Смотреть", url: "/collections/eco-friendly" }
      }
    ]
  },
  {
    id: "story_6",
    title: "Скидки",
    color: "#ff9f43", // оранжевый
    bgColor: "bg-[#ff9f43]",
    textColor: "text-white",
    handle: "sales",
    image: "/images/stories/sales.jpg",
    content: [
      {
        id: "step_1",
        title: "Специальные предложения",
        description: "Товары со скидками и акции этой недели",
        image: "/images/stories/sales-1.jpg",
        cta: { text: "К скидкам", url: "/collections/sale" }
      }
    ]
  },
  {
    id: "story_7",
    title: "Декор",
    color: "#a55eea", // фиолетовый
    bgColor: "bg-[#a55eea]",
    textColor: "text-white",
    handle: "decor",
    image: "/images/stories/decor.jpg",
    content: [
      {
        id: "step_1",
        title: "Декор для дома",
        description: "Стильные аксессуары для создания уютной атмосферы",
        image: "/images/stories/decor-1.jpg",
        cta: { text: "Смотреть", url: "/collections/decor" }
      }
    ]
  }
]

const StoriesNavigation = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [activeStory, setActiveStory] = useState<typeof stories[0] | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Обработчик начала перетаскивания
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0))
    setScrollLeft(containerRef.current?.scrollLeft || 0)
  }

  // Обработчик перетаскивания
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - (containerRef.current?.offsetLeft || 0)
    const walk = (x - startX) * 1.5 // Скорость прокрутки
    if (containerRef.current) {
      containerRef.current.scrollLeft = scrollLeft - walk
    }
  }

  // Обработчик завершения перетаскивания
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Открытие истории
  const openStory = (story: typeof stories[0]) => {
    setActiveStory(story)
    setCurrentStep(0)
    setIsModalOpen(true)
    
    // Автоматическое переключение через 5 секунд
    if (story.content.length > 1) {
      startStoryTimer()
    }
  }

  // Закрытие истории
  const closeStory = () => {
    setIsModalOpen(false)
    setActiveStory(null)
    setCurrentStep(0)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  // Переход к следующему шагу
  const nextStep = () => {
    if (!activeStory) return
    
    if (currentStep < activeStory.content.length - 1) {
      setCurrentStep(prev => prev + 1)
      startStoryTimer()
    } else {
      closeStory()
    }
  }

  // Переход к предыдущему шагу
  const prevStep = () => {
    if (!activeStory || currentStep === 0) return
    
    setCurrentStep(prev => prev - 1)
    startStoryTimer()
  }

  // Запуск таймера для автоматического переключения шагов
  const startStoryTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      if (activeStory && currentStep < activeStory.content.length - 1) {
        setCurrentStep(prev => prev + 1)
        startStoryTimer()
      } else {
        closeStory()
      }
    }, 5000) // 5 секунд на шаг
  }

  // Останавливаем таймер при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Добавляем обработчики событий при монтировании компонента
  useEffect(() => {
    const container = containerRef.current
    
    // Обработчик для сенсорных устройств
    const handleTouchStart = (e: TouchEvent) => {
      if (!container) return
      setIsDragging(true)
      setStartX(e.touches[0].pageX - container.offsetLeft)
      setScrollLeft(container.scrollLeft)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !container) return
      const x = e.touches[0].pageX - container.offsetLeft
      const walk = (x - startX) * 1.5
      container.scrollLeft = scrollLeft - walk
    }
    
    const handleTouchEnd = () => {
      setIsDragging(false)
    }
    
    // Добавляем обработчики сенсорных событий
    if (container) {
      container.addEventListener('touchstart', handleTouchStart, { passive: true })
      container.addEventListener('touchmove', handleTouchMove)
      container.addEventListener('touchend', handleTouchEnd)
    }
    
    // Удаляем обработчики при размонтировании
    return () => {
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart)
        container.removeEventListener('touchmove', handleTouchMove)
        container.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, startX, scrollLeft])

  return (
    <>
      <div className="pt-6 pb-4 border-b border-ui-border-base">
        <div className="content-container">
          <h2 className="text-xl font-medium mb-4">Наши подборки</h2>
          <div 
            ref={containerRef}
            className={`flex space-x-6 overflow-x-auto hide-scrollbar select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {stories.map((story) => (
              <button 
                key={story.id} 
                className="group flex flex-col items-center flex-shrink-0"
                onClick={() => openStory(story)}
              >
                <div className="relative mb-2 w-20 h-20 overflow-hidden rounded-full border-2 border-ui-border-base transition-all duration-200 group-hover:border-[#cbf401]">
                  <div className={`absolute inset-0 ${story.bgColor} flex items-center justify-center`}>
                    {/* Заглушка, которая будет заменена на изображение */}
                    <div className="w-full h-full flex items-center justify-center text-lg font-semibold">
                      {story.title.charAt(0)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-ui-fg-base whitespace-nowrap font-medium">
                  {story.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно для отображения истории */}
      <Modal isOpen={isModalOpen} close={closeStory} size="large">
        {activeStory && (
          <div className="w-full h-full relative">
            {/* Верхняя панель с индикаторами прогресса */}
            <div className="absolute top-0 left-0 right-0 z-10 p-2 px-4 flex gap-1">
              {activeStory.content.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1 rounded-full flex-grow transition-all duration-300 ${
                    index < currentStep ? "bg-white" : 
                    index === currentStep ? "bg-white/80" : "bg-white/40"
                  }`}
                />
              ))}
            </div>

            {/* Кнопка закрытия */}
            <button 
              className="absolute top-3 right-3 z-20 p-1 rounded-full bg-black/30 text-white hover:bg-black/50"
              onClick={closeStory}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Текущий шаг истории */}
            <div className="h-full w-full relative">
              {/* Фоновое изображение (заглушка) */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/80">
                <div className={`w-full h-full ${activeStory.bgColor} flex items-center justify-center`}>
                  <span className="text-white text-xl font-semibold">{activeStory.title}</span>
                </div>
              </div>
              
              {/* Контент */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  {activeStory.content[currentStep].title}
                </h3>
                <p className="mb-4 text-sm text-white/90">
                  {activeStory.content[currentStep].description}
                </p>
                <LocalizedClientLink
                  href={activeStory.content[currentStep].cta.url}
                  className={`inline-block px-6 py-2 rounded-full ${
                    activeStory.bgColor} ${activeStory.textColor} font-medium transition-transform hover:scale-105`}
                  onClick={() => {
                    closeStory()
                  }}
                >
                  {activeStory.content[currentStep].cta.text}
                </LocalizedClientLink>
              </div>
              
              {/* Области для перехода к следующему/предыдущему шагу */}
              <div 
                className="absolute top-0 left-0 w-1/3 h-full z-10"
                onClick={prevStep}
              />
              <div 
                className="absolute top-0 right-0 w-1/3 h-full z-10"
                onClick={nextStep}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default StoriesNavigation 