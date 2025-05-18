'use client'

import { HttpTypes } from "@medusajs/types"
import { Text, Heading } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import InteractiveLink from "@modules/common/components/interactive-link"
import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ArrowRightMini } from "@medusajs/icons"

type ProductSectionProps = {
  title: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  link?: {
    href: string
    text: string
  }
  variant?: "light" | "colored"
}

export default function ProductSection({ 
  title, 
  products, 
  region, 
  link, 
  variant = "light"
}: ProductSectionProps) {
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Проверяем возможность прокрутки продуктов
  const checkScrollButtons = () => {
    if (!containerRef.current) return
    
    const container = containerRef.current
    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
    setShowScrollButtons(container.scrollWidth > container.clientWidth)
  }

  // Функции для прокрутки влево/вправо
  const scrollLeft = () => {
    if (!containerRef.current) return
    containerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
  }
  
  const scrollRight = () => {
    if (!containerRef.current) return
    containerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
  }

  // Обработчик колеса мыши для предотвращения вертикальной прокрутки страницы
  const handleWheelScroll = (e: WheelEvent) => {
    const container = containerRef.current
    if (container && container.scrollWidth > container.clientWidth) {
      // Проверяем, что горизонтальная прокрутка преобладает (или равна) вертикальной
      // Позволяем небольшой перекос в сторону вертикальной для удобства на тачпадах
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 0.5) {
        e.preventDefault()
        // Вручную прокручиваем контейнер по горизонтали
        // Умножитель (здесь 1) можно настроить для изменения скорости прокрутки
        container.scrollLeft += e.deltaX * 1 
      }
      // Если вертикальная прокрутка значительно преобладает, 
      // позволяем странице скроллиться как обычно (не вызываем preventDefault)
    }
  }

  // Обновляем состояние кнопок при изменении размера окна или прокрутке
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    checkScrollButtons()
    
    const handleScroll = () => checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    
    container.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    // Добавляем слушатель колеса мыши
    // passive: false необходимо, чтобы работал preventDefault
    container.addEventListener('wheel', handleWheelScroll, { passive: false })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      // Удаляем слушатель колеса мыши
      container.removeEventListener('wheel', handleWheelScroll)
    }
  }, [])
  
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className={`w-full`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Heading level="h2" className="text-2xl md:text-3xl font-semibold">
            {title}
          </Heading>
          {variant === "colored" && (
            <Text className="text-gray-600 mt-1 text-sm">
              Специальные предложения и акции
            </Text>
          )}
        </div>
        
        {link && (
          <div className="mt-8 text-center">
            <InteractiveLink href={`/collections/${link.href}`}>
              {link.text}
            </InteractiveLink>
          </div>
        )}
      </div>
      
      <div className="relative">
        {showScrollButtons && (
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-opacity duration-200 ${
              canScrollLeft 
                ? 'bg-white text-black opacity-90 hover:opacity-100' 
                : 'bg-gray-100 text-gray-400 opacity-60 cursor-default'
            }`}
            aria-label="Прокрутить влево"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        
        <div 
          ref={containerRef}
          className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x snap-mandatory -mx-4 px-4"
        >
          {products.map((product) => {
            // Получаем название категории из type или categories
            const categoryTitle = product.type?.value 
                                  || (product.categories && product.categories.length > 0 ? product.categories[0].name : undefined);
            return (
              <div 
                key={product.id} 
                className="transform transition-transform duration-300 hover:-translate-y-1 flex-shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 xl:w-[calc(100%/7)] snap-start"
              >
                {/* Передаем categoryTitle в ProductPreview */}
                <ProductPreview 
                  product={product} 
                  region={region} 
                  categoryTitle={categoryTitle} 
                />
              </div>
            )
          })}
        </div>
        
        {showScrollButtons && (
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-opacity duration-200 ${
              canScrollRight 
                ? 'bg-white text-black opacity-90 hover:opacity-100' 
                : 'bg-gray-100 text-gray-400 opacity-60 cursor-default'
            }`}
            aria-label="Прокрутить вправо"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
} 