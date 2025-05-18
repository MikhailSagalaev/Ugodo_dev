'use client'

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Обновленные данные для stories категорий
const stories = [
  {
    id: "bathroom",
    title: "Ванная",
    color: "#07c4f5", // голубой
    bgColor: "bg-[#07c4f5]",
    textColor: "text-white", // Оставляем для цвета рамки/кнопки, но текст будет белым
    handle: "/collections/bathroom",
    image: "https://images.unsplash.com/photo-1598618443855-232ee0f819f6?q=80&w=1887&auto=format&fit=crop"
  },
  {
    id: "spring",
    title: "Весна 2024",
    color: "#cbf401", // салатовый
    bgColor: "bg-[#cbf401]",
    textColor: "text-black", // Текст будет белым
    handle: "/collections/spring",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1770&auto=format&fit=crop"
  },
  {
    id: "new",
    title: "Новинки",
    color: "#ffffff", // белый
    bgColor: "bg-white",
    textColor: "text-black", // Текст будет белым
    handle: "/collections/new",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1770&auto=format&fit=crop"
  },
  {
    id: "kitchen",
    title: "Для кухни",
    color: "#ff6b6b", // красный
    bgColor: "bg-[#ff6b6b]",
    textColor: "text-white",
    handle: "/collections/kitchen",
    image: "https://images.unsplash.com/photo-1556911220-e1af6782960d?q=80&w=1770&auto=format&fit=crop"
  },
  {
    id: "eco",
    title: "Экология",
    color: "#50d890", // зеленый
    bgColor: "bg-[#50d890]",
    textColor: "text-white",
    handle: "/collections/eco",
    image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?q=80&w=1772&auto=format&fit=crop"
  },
  {
    id: "sale",
    title: "Скидки",
    color: "#ff9f43", // оранжевый
    bgColor: "bg-[#ff9f43]",
    textColor: "text-white",
    handle: "/collections/sale",
    image: "https://images.unsplash.com/photo-1579547945413-49751891515a?q=80&w=1770&auto=format&fit=crop"
  },
  {
    id: "decor",
    title: "Декор",
    color: "#a55eea", // фиолетовый
    bgColor: "bg-[#a55eea]",
    textColor: "text-white",
    handle: "/collections/decor",
    image: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?q=80&w=1770&auto=format&fit=crop"
  }
]

// Добавим флаг просмотра, по умолчанию все не просмотрены
const storiesWithViewed = stories.map(story => ({ ...story, isViewed: false }));

const CategoryStories = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [activeStory, setActiveStory] = useState<typeof stories[0] | null>(null)
  const [activeStoryIndex, setActiveStoryIndex] = useState(-1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressDuration = 5000 // 5 секунд на историю
  // Состояние для отслеживания просмотренных историй (для примера, можно заменить на localStorage)
  const [viewedStories, setViewedStories] = useState<Record<string, boolean>>({});

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
  const openStory = (story: typeof stories[0], index: number) => {
    setActiveStory(story)
    setActiveStoryIndex(index)
    setIsModalOpen(true)
    setProgress(0)
    // Отмечаем историю как просмотренную при ее открытии/отображении
    setViewedStories(prev => ({ ...prev, [story.id]: true }));
    startProgressTimer() // startProgressTimer уже должен вызываться здесь, если нет, то добавить
  }

  // Закрытие истории
  const closeStory = () => {
    setIsModalOpen(false)
    setActiveStory(null)
    setActiveStoryIndex(-1)
    stopProgressTimer()
  }

  // Переход к следующей истории
  const nextStory = () => {
    if (activeStoryIndex < stories.length - 1) {
      const nextIndex = activeStoryIndex + 1;
      setActiveStoryIndex(nextIndex)
      setActiveStory(stories[nextIndex])
      setProgress(0)
      // Отмечаем новую активную историю как просмотренную
      setViewedStories(prev => ({ ...prev, [stories[nextIndex].id]: true }));
      startProgressTimer() // Убедимся, что таймер перезапускается
    } else {
      closeStory()
    }
  }

  // Переход к предыдущей истории
  const prevStory = () => {
    if (activeStoryIndex > 0) {
      const prevIndex = activeStoryIndex - 1;
      setActiveStoryIndex(prevIndex)
      setActiveStory(stories[prevIndex])
      setProgress(0)
      // Отмечаем новую активную историю как просмотренную
      setViewedStories(prev => ({ ...prev, [stories[prevIndex].id]: true }));
      startProgressTimer() // Убедимся, что таймер перезапускается
    }
  }

  // Запуск таймера прогресса
  const startProgressTimer = () => {
    if (isPaused) return; // Не запускаем, если на паузе
    
    stopProgressTimer()
    
    const startTime = Date.now()
    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime
      const newProgress = Math.min((elapsedTime / progressDuration) * 100, 100)
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        nextStory()
      }
    }
    
    progressIntervalRef.current = setInterval(updateProgress, 50)
  }

  // Остановка таймера прогресса
  const stopProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  // Мониторинг активной истории и перезапуск таймера при изменении истории
  useEffect(() => {
    if (isModalOpen && activeStory && !isPaused) {
      startProgressTimer()
    }
    
    return () => {
      stopProgressTimer()
    }
  }, [activeStoryIndex, isModalOpen, isPaused])

  // Удаляем слушателей событий при размонтировании компонента
  useEffect(() => {
    return () => {
      stopProgressTimer()
    }
  }, [])

  // Обработка клавиш клавиатуры
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return
      
      switch(e.key) {
        case 'ArrowLeft':
          prevStory()
          break
        case 'ArrowRight':
          nextStory()
          break
        case 'Escape':
          closeStory()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, activeStoryIndex])

  // Добавляем обработчики событий для сенсорных устройств
  useEffect(() => {
    const container = containerRef.current
    
    // Обработчик для сенсорных устройств
    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true)
      setStartX(e.touches[0].pageX - (container?.offsetLeft || 0))
      setScrollLeft(container?.scrollLeft || 0)
    }
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const x = e.touches[0].pageX - (container?.offsetLeft || 0)
      const walk = (x - startX) * 1.5
      if (container) {
        container.scrollLeft = scrollLeft - walk
      }
    }
    
    const handleTouchEnd = () => {
      setIsDragging(false)
    }
    
    // Добавляем слушателей событий
    container?.addEventListener('touchstart', handleTouchStart)
    container?.addEventListener('touchmove', handleTouchMove)
    container?.addEventListener('touchend', handleTouchEnd)
    
    // Удаляем слушателей при размонтировании
    return () => {
      container?.removeEventListener('touchstart', handleTouchStart)
      container?.removeEventListener('touchmove', handleTouchMove)
      container?.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, startX, scrollLeft])

  // Пауза истории
  const pauseStory = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation() // Предотвращаем всплытие события
    setIsPaused(true)
    stopProgressTimer()
  }

  // Возобновление истории
  const resumeStory = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation() // Предотвращаем всплытие события
    setIsPaused(false)
    
    const remainingTime = progressDuration * (1 - progress / 100)
    const startTime = Date.now() - (progressDuration - remainingTime)
    
    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime
      const newProgress = Math.min((elapsedTime / progressDuration) * 100, 100)
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        nextStory()
      }
    }
    
    progressIntervalRef.current = setInterval(updateProgress, 50)
  }

  return (
    <div className="pt-0 px-4">
      <div 
        ref={containerRef}
        className="flex justify-center overflow-x-auto scrollbar-hide py-4 space-x-2 pl-4 pr-8 md:pl-0 md:pr-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {stories.map((story, index) => (
          <div // Основной контейнер для одного элемента истории (кружок + текст под ним)
            key={story.id}
            className={`flex-shrink-0 w-16 flex flex-col items-center cursor-pointer group transform transition-all duration-300 ease-in-out mb-4`}
            onClick={() => openStory(story, index)}
            role="button"
            aria-label={`Открыть историю: ${story.title}`}
          >
            <div // Контейнер для кружка
              className={`w-16 h-16 rounded-full relative overflow-hidden border-2 border-white ring-1 ring-black group-hover:ring-gray-300 ${story.bgColor} ${story.textColor} flex items-center justify-center transition-all duration-200`}
            >
              <span className="font-semibold text-center text-xs uppercase tracking-wider px-1">
                NEW
              </span>
            </div>
            {/* Текст под круглой историей */}
            <span 
              className="mt-2 text-xs font-medium text-center w-full text-gray-700 dark:text-gray-300 transition-opacity duration-300">
              {story.title}
            </span>
          </div>
        ))}
      </div>

      {/* Модальное окно для отображения полноразмерной истории */}
      {isModalOpen && activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full max-w-lg h-[80vh] bg-black rounded-lg overflow-hidden">
            {/* Индикатор прогресса */}
            <div className="absolute top-0 left-0 right-0 z-10 flex px-2 pt-2 gap-1">
              {stories.map((_, idx) => (
                <div 
                  key={idx} 
                  className="h-1 bg-gray-500 bg-opacity-50 flex-1 rounded-full overflow-hidden"
                >
                  {idx === activeStoryIndex && (
                    <div 
                      className="h-full bg-white" 
                      style={{ width: `${progress}%`, transition: isPaused ? 'none' : 'width 0.05s linear' }}
                    />
                  )}
                  {idx < activeStoryIndex && (
                    <div className="h-full bg-white w-full" />
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                closeStory();
              }}
              className="absolute top-4 right-4 z-20 text-white p-2 rounded-full bg-black bg-opacity-70 hover:bg-opacity-100"
            >
              <X size={28} />
            </button>
            
            {/* Навигация влево/вправо */}
            <div className="absolute inset-0 flex">
              <div 
                className="w-1/2 h-full z-10" 
                onClick={(e) => {
                  e.stopPropagation()
                  prevStory()
                }}
                onMouseDown={pauseStory}
                onMouseUp={resumeStory}
                onTouchStart={pauseStory}
                onTouchEnd={resumeStory}
              />
              <div 
                className="w-1/2 h-full z-10" 
                onClick={(e) => {
                  e.stopPropagation()
                  nextStory()
                }}
                onMouseDown={pauseStory}
                onMouseUp={resumeStory}
                onTouchStart={pauseStory}
                onTouchEnd={resumeStory}
              />
            </div>
            
            <div className="h-full relative">
              <Image 
                src={activeStory.image} 
                alt={activeStory.title}
                fill
                className="object-cover"
                priority
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                {/* Устанавливаем цвет текста заголовка всегда белым */}
                <h3 className="text-2xl font-bold text-white">{activeStory.title}</h3>
                <div 
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    closeStory()
                  }}
                >
                  <LocalizedClientLink 
                    href={activeStory.handle}
                    /* Устанавливаем цвет текста кнопки всегда белым, сохраняем фон */
                    className={`inline-block mt-4 px-6 py-2 rounded-full ${activeStory.bgColor} text-white font-medium`}
                  >
                    Смотреть
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Добавляем CSS для скрытия полосы прокрутки */}
      <style jsx global>{`
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE и Edge */
          scrollbar-width: none;  /* Firefox */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;  /* Chrome, Safari и Opera */
        }
      `}</style>
    </div>
  )
}

export default CategoryStories 