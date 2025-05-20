'use client'

import React, { useRef, useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import useEmblaCarousel from 'embla-carousel-react'

type ProductSliderProps = {
  title: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
}

export default function ProductSlider({ 
  title, 
  products, 
  region
}: ProductSliderProps) {
  // Определяем разные настройки для мобильной и десктопной версий
  const [isMobile, setIsMobile] = useState(false)
  
  // Инициализируем Embla Carousel с разными опциями в зависимости от устройства
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: isMobile ? 'auto' : 1, // На мобильных скроллит на сколько проскроллили
    startIndex: 1,
    containScroll: isMobile ? 'trimSnaps' : undefined // Для мобильных - свободный скролл
  })

  // Определяем тип флажка в зависимости от заголовка блока
  const getBadgeType = () => {
    const normalizedTitle = title.toLowerCase();
    if (normalizedTitle.includes('новинки')) {
      return "new";
    } else if (normalizedTitle.includes('популярное') || normalizedTitle.includes('хит')) {
      return "hit";
    }
    return "none";
  };

  const badgeType = getBadgeType();

  // Определяем количество карточек в группе в зависимости от размера экрана
  const [itemsPerGroup, setItemsPerGroup] = useState(4);
  
  useEffect(() => {
    // Функция для определения количества карточек и типа устройства
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      
      if (mobile) {
        setItemsPerGroup(1); // Мобильные устройства - 1 карточка
      } else if (window.innerWidth < 1024) {
        setItemsPerGroup(2); // Планшеты - 2 карточки
      } else if (window.innerWidth < 1280) {
        setItemsPerGroup(3); // Маленькие десктопы - 3 карточки
      } else {
        setItemsPerGroup(4); // Большие десктопы - 4 карточки
      }
    };
    
    // Вызываем функцию при монтировании и изменении размера окна
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Группируем продукты в зависимости от количества карточек в группе
  const productGroups = []
  for (let i = 0; i < products.length; i += itemsPerGroup) {
    productGroups.push(products.slice(i, i + itemsPerGroup))
  }

  return (
    <section className="py-6 md:py-8">
      <div className="content-container px-0 sm:px-4 md:px-8 relative">
        <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
          <Heading level="h2" className="text-2xl md:text-3xl font-bold uppercase">{title}</Heading>
          
          {/* Навигационные стрелки только для десктопа */}
          {!isMobile && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => emblaApi?.scrollPrev()}
                className="w-7 h-7 flex items-center justify-center transition-colors hover:text-gray-500"
                aria-label="Предыдущие товары"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                onClick={() => emblaApi?.scrollNext()}
                className="w-7 h-7 flex items-center justify-center transition-colors hover:text-gray-500"
                aria-label="Следующие товары"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          {isMobile ? (
            // Мобильная версия - индивидуальные карточки шириной 225px без группировки
            <div className="flex pl-4 pr-4">
              {products.map((product) => {
                const categoryTitle = product.type?.value || 
                  (product.categories && product.categories.length > 0 ? 
                    product.categories[0].name : undefined);
                
                return (
                  <div 
                    key={product.id} 
                    className="flex-[0_0_225px] mr-4 min-w-0"
                  >
                    <ProductPreview 
                      product={product} 
                      region={region} 
                      categoryTitle={categoryTitle}
                      badgeType={badgeType}
                      textAlign="left"
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            // Десктопная версия - группы карточек с переключением
            <div className="flex">
              {productGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex-[0_0_100%] min-w-0">
                  <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-8">
                    {group.map((product) => {
                      const categoryTitle = product.type?.value || 
                        (product.categories && product.categories.length > 0 ? 
                          product.categories[0].name : undefined);
                      
                      return (
                        <div 
                          key={product.id} 
                          className="flex justify-center w-full sm:w-[calc(50%-12px)] md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] xl:w-[calc(25%-24px)]"
                        >
                          <ProductPreview 
                            product={product} 
                            region={region} 
                            categoryTitle={categoryTitle}
                            badgeType={badgeType}
                            textAlign="left"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
} 