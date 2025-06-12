'use client'

import React, { useRef, useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import useEmblaCarousel from 'embla-carousel-react'
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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
  const [itemsPerGroup, setItemsPerGroup] = useState(6);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const tabletOrMobile = window.innerWidth <= 1119;
      setIsTabletOrMobile(tabletOrMobile);
      
      setItemsPerGroup(6);
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

  const getPageLink = () => {
    const normalizedTitle = title.toLowerCase();
    if (normalizedTitle.includes('новинки')) {
      return "/new-arrivals";
    } else if (normalizedTitle.includes('популярное') || normalizedTitle.includes('хит')) {
      return "/bestsellers";
    }
    return "#";
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6' }}>
      <section style={{ paddingTop: '16px', paddingBottom: '16px' }}>
        <div className="content-container px-0 sm:px-4 md:px-8 relative" style={{ backgroundColor: '#f8f9fa', borderRadius: '32px', paddingTop: '24px', paddingBottom: '24px' }}>
        <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
          <LocalizedClientLink href={getPageLink()}>
            <Heading 
              level="h2" 
              className="text-2xl md:text-3xl font-bold uppercase hover:text-gray-600 transition-colors cursor-pointer"
            >
              {title}
            </Heading>
          </LocalizedClientLink>
          
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
          <div className="w-full flex flex-row gap-[12px] overflow-x-auto pl-[10px] pr-[20px] scrollbar-hide product-slider-mobile">
            {products.map((product, index) => {
              const categoryTitle = product.type?.value || 
                (product.categories && product.categories.length > 0 ? 
                  product.categories[0].name : undefined);
              
              return (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-[200px]"
                >
                  <div className="product-card-compact w-full">
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
                  <div 
                    className="w-full px-4"
                    style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: '12px'
                    }}
                  >
                    {group.map((product) => {
                      const categoryTitle = product.type?.value || 
                        (product.categories && product.categories.length > 0 ? 
                          product.categories[0].name : undefined);
                      
                      return (
                        <div 
                          key={product.id} 
                          className="product-card-featured"
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
    </div>
  )
} 