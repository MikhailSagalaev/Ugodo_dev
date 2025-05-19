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
    slidesToScroll: 1
  })

  // Группируем продукты по 4 штуки для слайдера
  const productGroups = []
  for (let i = 0; i < products.length; i += 4) {
    productGroups.push(products.slice(i, i + 4))
  }

  return (
    <section className="py-6 md:py-8">
      <div className="content-container px-4 md:px-8 relative">
        <div className="flex items-center justify-between mb-8">
          <Heading level="h2" className="text-2xl md:text-3xl font-bold uppercase">{title}</Heading>
          
          {/* Навигационные стрелки в стиле со скриншота */}
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
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {productGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="flex-[0_0_100%] min-w-0">
                <div className="flex justify-center gap-8">
                  {group.map((product, index) => {
                    const categoryTitle = product.type?.value || 
                      (product.categories && product.categories.length > 0 ? 
                        product.categories[0].name : undefined);
                    
                    // Выравнивание текста: первые две карточки - справа, остальные - слева
                    const textAlign = index < 2 ? "right" : "left";
                    
                    return (
                      <div 
                        key={product.id} 
                        className="flex justify-center"
                      >
                        <ProductPreview 
                          product={product} 
                          region={region} 
                          categoryTitle={categoryTitle}
                          textAlign={textAlign}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 