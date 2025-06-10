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
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [activeModal, setActiveModal] = useState<'main' | 'subcategory' | 'subsubcategory'>('main')
  const [selectedCategory, setSelectedCategory] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<HttpTypes.StoreProductCategory | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isVisible && categories.length === 0) {
      setLoading(true)
      fetch('/api/categories')
        .then(res => res.json())
        .then((data) => {
          setCategories(data || [])
        })
        .catch((error) => {
          console.error("Ошибка загрузки категорий:", error)
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

    if (isVisible && !isMobile) {
      document.addEventListener('click', handleClick)
      return () => {
        document.removeEventListener('click', handleClick)
      }
    }
  }, [isVisible, onClose, isMobile])

  if (!isVisible) return null

  const parentCategories = categories.filter(cat => !cat.parent_category_id)

  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parent_category_id === parentId)
  }

  const handleCategoryClick = (category: HttpTypes.StoreProductCategory) => {
    if (isMobile) {
      const children = getSubcategories(category.id)
      if (children.length > 0) {
        setSelectedCategory(category)
        setActiveModal('subcategory')
      }
    }
  }

  const handleSubcategoryClick = (subcategory: HttpTypes.StoreProductCategory) => {
    if (isMobile) {
      const children = getSubcategories(subcategory.id)
      if (children.length > 0) {
        setSelectedSubcategory(subcategory)
        setActiveModal('subsubcategory')
      }
    }
  }

  const handleBackToMain = () => {
    setActiveModal('main')
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleBackToSubcategory = () => {
    setActiveModal('subcategory')
    setSelectedSubcategory(null)
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-white z-[100] overflow-y-auto">
        {activeModal === 'main' && (
          <div className="min-h-screen flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Каталог</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <div className="space-y-1">
                {parentCategories.map((category) => {
                  const children = getSubcategories(category.id)
                  const hasChildren = children.length > 0
                  return (
                    <div key={category.id}>
                      {hasChildren ? (
                        <button
                          onClick={() => handleCategoryClick(category)}
                          className="flex items-center justify-between w-full text-left text-black hover:text-gray-400 transition-colors text-base font-medium"
                          style={{ 
                            padding: "12px 16px",
                            height: "50px"
                          }}
                        >
                          <span>{category.name}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <LocalizedClientLink
                          href={`/categories/${category.handle}`}
                          className="flex items-center justify-between w-full text-black hover:text-gray-400 transition-colors text-base font-medium"
                          style={{ 
                            padding: "12px 16px",
                            height: "50px"
                          }}
                          onClick={onClose}
                        >
                          <span>{category.name}</span>
                        </LocalizedClientLink>
                      )}
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-8">
                <LocalizedClientLink
                  href="/store"
                                      className="inline-flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black font-medium rounded-md transition-colors text-xs w-full justify-center"
                  onClick={onClose}
                >
                  Смотреть весь каталог
                </LocalizedClientLink>
              </div>
            </div>
            
            <div className="p-4">
              <div className="relative w-full rounded-lg overflow-hidden" style={{ height: "172px" }}>
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

        {activeModal === 'subcategory' && selectedCategory && (
          <div className="min-h-screen flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={handleBackToMain}
                  className="p-2 hover:bg-gray-100 rounded-full mr-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <h2 className="text-lg font-medium">{selectedCategory.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <div className="space-y-1">
                {getSubcategories(selectedCategory.id).map((subcategory) => {
                  const children = getSubcategories(subcategory.id)
                  const hasChildren = children.length > 0
                  return (
                    <div key={subcategory.id}>
                      {hasChildren ? (
                        <button
                          onClick={() => handleSubcategoryClick(subcategory)}
                          className="flex items-center justify-between w-full text-left text-black hover:text-gray-400 transition-colors text-base font-medium"
                          style={{ 
                            padding: "12px 16px",
                            height: "50px"
                          }}
                        >
                          <span>{subcategory.name}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <LocalizedClientLink
                          href={`/categories/${subcategory.handle}`}
                          className="flex items-center justify-between w-full text-black hover:text-gray-400 transition-colors text-base font-medium"
                          style={{ 
                            padding: "12px 16px",
                            height: "50px"
                          }}
                          onClick={onClose}
                        >
                          <span>{subcategory.name}</span>
                        </LocalizedClientLink>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div className="p-4">
              <div className="relative w-full rounded-lg overflow-hidden" style={{ height: "172px" }}>
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

        {activeModal === 'subsubcategory' && selectedSubcategory && (
          <div className="min-h-screen flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={handleBackToSubcategory}
                  className="p-2 hover:bg-gray-100 rounded-full mr-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <h2 className="text-lg font-medium">{selectedSubcategory.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <div className="space-y-1">
                {getSubcategories(selectedSubcategory.id).map((subsubcategory) => (
                  <LocalizedClientLink
                    key={subsubcategory.id}
                    href={`/categories/${subsubcategory.handle}`}
                    className="flex items-center justify-between w-full text-black hover:text-gray-400 transition-colors text-base font-medium"
                    style={{ 
                      padding: "12px 16px",
                      height: "50px"
                    }}
                    onClick={onClose}
                  >
                    <span>{subsubcategory.name}</span>
                  </LocalizedClientLink>
                ))}
              </div>
            </div>
            
            <div className="p-4">
              <div className="relative w-full rounded-lg overflow-hidden" style={{ height: "172px" }}>
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
    )
  }

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-[80px] left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-[100]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={() => {
        setHoveredCategory(null)
        setHoveredSubcategory(null)
        if (onMouseLeave) onMouseLeave()
      }}
    >
      <div className="content-container py-8">
        {loading ? (
          <div className="text-center py-8">
            <span className="text-gray-500">Загрузка категорий...</span>
          </div>
        ) : (
          <div className="flex">
            <div className="flex-1 max-w-[750px]">
              <div className="flex">
                <div className="min-w-[250px]">
                  {parentCategories.map((category) => {
                    const children = getSubcategories(category.id)
                    const hasChildren = children.length > 0
                    return (
                      <div
                        key={category.id}
                        className="relative mb-1"
                        onMouseEnter={() => {
                          setHoveredCategory(category.id)
                          setHoveredSubcategory(null)
                        }}
                      >
                        <LocalizedClientLink
                          href={`/categories/${category.handle}`}
                          className="flex items-center justify-between text-black hover:text-gray-400 transition-colors text-sm font-medium"
                          style={{ 
                            padding: "6px 12px",
                            height: "32px"
                          }}
                          onClick={onClose}
                        >
                          <span>{category.name}</span>
                          {hasChildren && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
                      className="inline-flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black font-medium rounded-md transition-colors text-xs"
                      onClick={onClose}
                    >
                      Смотреть весь каталог
                    </LocalizedClientLink>
                  </div>
                </div>
                
                {hoveredCategory && (
                  <div className="min-w-[250px] pl-4">
                    <div 
                      className="space-y-1"
                      onMouseEnter={() => setHoveredCategory(hoveredCategory)}
                    >
                      {(() => {
                        const children = getSubcategories(hoveredCategory)
                        
                        if (children.length === 0) return null
                        
                        return (
                          <>
                            {children.map((child) => {
                              const grandchildren = getSubcategories(child.id)
                              const hasGrandchildren = grandchildren.length > 0
                              return (
                                <div
                                  key={child.id}
                                  className="relative"
                                  onMouseEnter={() => setHoveredSubcategory(child.id)}
                                >
                                  <LocalizedClientLink
                                    href={`/categories/${child.handle}`}
                                    className="flex items-center justify-between text-black hover:text-gray-400 transition-colors text-sm font-medium"
                                    style={{ 
                                      padding: "6px 12px",
                                      height: "32px"
                                    }}
                                    onClick={onClose}
                                  >
                                    <span>{child.name}</span>
                                    {hasGrandchildren && (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    )}
                                  </LocalizedClientLink>
                                </div>
                              )
                            })}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
                
                {hoveredSubcategory && (
                  <div className="min-w-[250px] pl-4">
                    <div 
                      className="space-y-1"
                      onMouseEnter={() => setHoveredSubcategory(hoveredSubcategory)}
                    >
                      {(() => {
                        const grandchildren = getSubcategories(hoveredSubcategory)
                        
                        if (grandchildren.length === 0) return null
                        
                        return (
                          <>
                            {grandchildren.map((grandchild) => (
                              <LocalizedClientLink
                                key={grandchild.id}
                                href={`/categories/${grandchild.handle}`}
                                className="block text-black hover:text-gray-400 transition-colors text-sm font-medium"
                                style={{ 
                                  padding: "6px 12px",
                                  height: "32px",
                                  lineHeight: "20px"
                                }}
                                onClick={onClose}
                              >
                                {grandchild.name}
                              </LocalizedClientLink>
                            ))}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div 
              className="w-1/3 flex items-center justify-center"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
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
