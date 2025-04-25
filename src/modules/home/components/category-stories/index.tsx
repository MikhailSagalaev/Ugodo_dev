'use client'

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Данные для stories категорий
const stories = [
  {
    id: "bathroom",
    title: "Ванная",
    color: "#07c4f5", // голубой
    bgColor: "bg-[#07c4f5]",
    textColor: "text-white",
    handle: "/collections/bathroom",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "spring",
    title: "Весна 2024",
    color: "#cbf401", // салатовый
    bgColor: "bg-[#cbf401]",
    textColor: "text-black",
    handle: "/collections/spring",
    image: "https://images.unsplash.com/photo-1487139975590-b4f1dce9b035?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "new",
    title: "Новинки",
    color: "#ffffff", // белый
    bgColor: "bg-white",
    textColor: "text-black",
    handle: "/collections/new",
    image: "https://images.unsplash.com/photo-1538584588675-cbf272fe53af?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "kitchen",
    title: "Для кухни",
    color: "#ff6b6b", // красный
    bgColor: "bg-[#ff6b6b]",
    textColor: "text-white",
    handle: "/collections/kitchen",
    image: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "eco",
    title: "Экология",
    color: "#50d890", // зеленый
    bgColor: "bg-[#50d890]",
    textColor: "text-white",
    handle: "/collections/eco",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "sale",
    title: "Скидки",
    color: "#ff9f43", // оранжевый
    bgColor: "bg-[#ff9f43]",
    textColor: "text-white",
    handle: "/collections/sale",
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  },
  {
    id: "decor",
    title: "Декор",
    color: "#a55eea", // фиолетовый
    bgColor: "bg-[#a55eea]",
    textColor: "text-white",
    handle: "/collections/decor",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1558&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  }
]

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
    startProgressTimer()
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
      setActiveStoryIndex(prev => prev + 1)
      setActiveStory(stories[activeStoryIndex + 1])
      setProgress(0)
      startProgressTimer()
    } else {
      closeStory()
    }
  }

  // Переход к предыдущей истории
  const prevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(prev => prev - 1)
      setActiveStory(stories[activeStoryIndex - 1])
      setProgress(0)
      startProgressTimer()
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
    <div className="mt-4 mb-6 overflow-hidden">
      <div 
        ref={containerRef}
        className="flex overflow-x-auto pb-2 px-4 hide-scrollbar justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {stories.map((story, index) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center mr-4 cursor-pointer" 
            onClick={() => openStory(story, index)}
          >
            <div className={`w-20 h-20 rounded-full overflow-hidden border-2 border-${story.id === 'new' ? 'gray-200' : story.color} flex-shrink-0`}>
              <Image 
                src={story.image} 
                alt={story.title}
                width={80} 
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm mt-1">{story.title}</span>
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
                <h3 className={`text-2xl font-bold ${activeStory.textColor}`}>{activeStory.title}</h3>
                <LocalizedClientLink 
                  href={activeStory.handle}
                  className={`inline-block mt-4 px-6 py-2 rounded-full ${activeStory.bgColor} ${activeStory.textColor} font-medium`}
                  onClick={(e) => {
                    e.stopPropagation()
                    closeStory()
                  }}
                >
                  Смотреть
                </LocalizedClientLink>
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