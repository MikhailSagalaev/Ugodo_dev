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

  // Обновляем состояние кнопок при изменении размера окна или прокрутке
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    checkScrollButtons()
    
    const handleScroll = () => checkScrollButtons()
    const handleResize = () => checkScrollButtons()
    
    container.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className={`w-full ${variant === "colored" ? "bg-gradient-to-r from-violet-50 to-pink-50" : ""}`}>
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
          <InteractiveLink 
            href={link.href}
            className="mt-2 md:mt-0 text-violet-600 hover:text-violet-700 flex items-center gap-1 group"
          >
            <span>{link.text}</span>
            <ArrowRightMini className="w-5 h-5 transform transition-transform group-hover:translate-x-1" />
          </InteractiveLink>
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
          {products.map((product) => (
            <div 
              key={product.id} 
              className="transform transition-transform duration-300 hover:-translate-y-1 flex-shrink-0 w-[calc(100%-1rem)] sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1rem)] snap-start"
            >
              <ProductPreview product={product} region={region} />
            </div>
          ))}
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