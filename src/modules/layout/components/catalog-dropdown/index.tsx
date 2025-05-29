'use client'

import { useState, useEffect, useRef } from "react"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"

interface CatalogDropdownProps {
  isVisible: boolean
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

const CatalogDropdown = ({ isVisible, onClose, onMouseEnter, onMouseLeave }: CatalogDropdownProps) => {
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && categories.length === 0) {
      setLoading(true)
      console.log('🔄 Загружаем категории с фронтенда...')
      fetch('/api/categories')
        .then(res => {
          console.log('📡 Ответ API категорий:', res.status, res.statusText)
          return res.json()
        })
        .then((data) => {
          console.log('📥 Данные категорий на фронтенде:', data)
          console.log('📊 Количество категорий:', data?.length || 0)
          if (data && data.length > 0) {
            console.log('🏷️ Первая категория:', data[0])
            console.log('👨‍👩‍👧‍👦 Родительские категории:', data.filter((cat: any) => !cat.parent_category_id))
          }
          setCategories(data || [])
        })
        .catch((error) => {
          console.error("❌ Ошибка загрузки категорий на фронтенде:", error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isVisible, categories.length])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('click', handleClick)
      return () => {
        document.removeEventListener('click', handleClick)
      }
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  // Фильтруем только родительские категории (без parent_category_id)
  const parentCategories = categories.filter(cat => !cat.parent_category_id)

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-[134px] left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[100]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="content-container py-8">
        {loading ? (
          <div className="text-center py-8">
            <span className="text-gray-500">Загрузка категорий...</span>
          </div>
        ) : (
          <div className="flex">
            {/* Левая колонка - родительские категории */}
            <div className="w-1/3 space-y-2">
              {parentCategories.map((category) => {
                const hasChildren = category.category_children && category.category_children.length > 0
                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="flex items-center justify-between p-3 text-lg text-black hover:bg-gray-50 hover:text-[#C2E7DA] transition-colors font-medium rounded-md"
                      onClick={onClose}
                    >
                      <span>{category.name}</span>
                      {hasChildren && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </LocalizedClientLink>
                  </div>
                )
              })}
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <LocalizedClientLink
                  href="/store"
                  className="inline-flex items-center px-6 py-3 bg-[#BAFF29] hover:bg-[#C2E7DA] text-black font-medium rounded-md transition-colors"
                  onClick={onClose}
                >
                  Смотреть весь каталог
                </LocalizedClientLink>
              </div>
            </div>
            
            {/* Средняя колонка - подкатегории */}
            <div className="w-1/3 px-6">
              {hoveredCategory && (
                <div className="space-y-2">
                  {(() => {
                    const hoveredCat = parentCategories.find(cat => cat.id === hoveredCategory)
                    const children = hoveredCat?.category_children || []
                    
                    if (children.length === 0) return null
                    
                    return (
                      <>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
                          {hoveredCat?.name}
                        </h3>
                        {children.map((child) => (
                          <LocalizedClientLink
                            key={child.id}
                            href={`/categories/${child.handle}`}
                            className="block p-2 text-base text-black hover:bg-gray-50 hover:text-[#C2E7DA] transition-colors rounded-md"
                            onClick={onClose}
                          >
                            {child.name}
                          </LocalizedClientLink>
                        ))}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
            
            {/* Правая колонка - баннер */}
            <div className="w-1/3 flex items-center justify-center">
              <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                <Image
                  src="/images/banners/banner.png"
                  alt="Каталог товаров"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CatalogDropdown 