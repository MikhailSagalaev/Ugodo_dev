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
 
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    slidesToScroll: 1,
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
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const tabletOrMobile = window.innerWidth <= 1119;
      setIsTabletOrMobile(tabletOrMobile);
      
      setItemsPerGroup(4); // Всегда 4 карточки в группе для десктопа
    };
    
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
          
          {!isTabletOrMobile && (
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

        {isTabletOrMobile ? (
          <div className="w-full flex flex-row gap-5 overflow-x-auto pl-[10px] pr-[20px] scrollbar-hide">
            {products.map((product, index) => {
              const categoryTitle = product.type?.value || 
                (product.categories && product.categories.length > 0 ? 
                  product.categories[0].name : undefined);
              
              return (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-[200px]"
                >
                  <div className="aspect-[3/4] w-full">
                    <ProductPreview 
                      product={product} 
                      region={region} 
                      categoryTitle={categoryTitle}
                      badgeType={badgeType}
                      textAlign="left"
                      firstInRow={index === 0}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {productGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex-[0_0_100%] min-w-0">
                  <div className="flex justify-center px-16" style={{ gap: 'clamp(18px, 2.5vw, 35px)' }}>
                    {group.map((product) => {
                      const categoryTitle = product.type?.value || 
                        (product.categories && product.categories.length > 0 ? 
                          product.categories[0].name : undefined);
                      
                      return (
                        <div 
                          key={product.id} 
                          className="flex justify-center"
                          style={{ 
                            width: 'clamp(180px, calc(180px + (260 - 180) * ((100vw - 1120px) / (1920 - 1120))), 260px)'
                          }}
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
          </div>
        )}
      </div>
    </section>
  )
} 