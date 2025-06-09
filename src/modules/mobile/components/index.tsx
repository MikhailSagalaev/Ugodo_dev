'use client'

import React, { useState, useEffect } from 'react'
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@medusajs/ui"
import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type MobileNavProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const MobileNav = ({ isOpen, setIsOpen }: MobileNavProps) => {
  const [categories, setCategories] = useState<HttpTypes.StoreProductCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [activeModal, setActiveModal] = useState<'main' | 'catalog' | 'subcategory' | 'subsubcategory'>('main')
  const [selectedCategory, setSelectedCategory] = useState<HttpTypes.StoreProductCategory | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<HttpTypes.StoreProductCategory | null>(null)

  useEffect(() => {
    if (isOpen && categories.length === 0) {
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
  }, [isOpen, categories.length])

  const parentCategories = categories.filter(cat => !cat.parent_category_id)

  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parent_category_id === parentId)
  }

  const handleCatalogClick = () => {
    setActiveModal('catalog')
  }

  const handleCategoryClick = (category: HttpTypes.StoreProductCategory) => {
    const children = getSubcategories(category.id)
    if (children.length > 0) {
      setSelectedCategory(category)
      setActiveModal('subcategory')
    }
  }

  const handleSubcategoryClick = (subcategory: HttpTypes.StoreProductCategory) => {
    const children = getSubcategories(subcategory.id)
    if (children.length > 0) {
      setSelectedSubcategory(subcategory)
      setActiveModal('subsubcategory')
    }
  }

  const handleBackToMain = () => {
    setActiveModal('main')
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleBackToCatalog = () => {
    setActiveModal('catalog')
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleBackToSubcategory = () => {
    setActiveModal('subcategory')
    setSelectedSubcategory(null)
  }

  const handleClose = () => {
    setIsOpen(false)
    setActiveModal('main')
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={handleClose}
        />
      )}
      
      {/* Mobile menu */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {activeModal === 'main' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Меню</h2>
              <button 
                className="p-2 hover:bg-gray-100 rounded-full" 
                onClick={handleClose}
              >
                <XMark className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <nav className="space-y-1">
                <div>
                  <LocalizedClientLink 
                    href="/" 
                    className="flex items-center gap-3 text-base font-medium hover:text-gray-400 transition-colors"
                    style={{ 
                      padding: "12px 16px",
                      height: "50px"
                    }}
                    onClick={handleClose}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                    Главная
                  </LocalizedClientLink>
                </div>
                
                <div>
                  <button
                    onClick={handleCatalogClick}
                    className="flex items-center justify-between w-full text-left text-black hover:text-gray-400 transition-colors text-base font-medium"
                    style={{ 
                      padding: "12px 16px",
                      height: "50px"
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                      </svg>
                      Каталог
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div>
                  <LocalizedClientLink 
                    href="/search" 
                    className="flex items-center gap-3 text-base font-medium hover:text-gray-400 transition-colors"
                    style={{ 
                      padding: "12px 16px",
                      height: "50px"
                    }}
                    onClick={handleClose}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    Поиск
                  </LocalizedClientLink>
                </div>
                
                <div>
                  <LocalizedClientLink 
                    href="/wishlist" 
                    className="flex items-center gap-3 text-base font-medium hover:text-gray-400 transition-colors"
                    style={{ 
                      padding: "12px 16px",
                      height: "50px"
                    }}
                    onClick={handleClose}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    Избранное
                  </LocalizedClientLink>
                </div>
                
                <div>
                  <LocalizedClientLink 
                    href="/account" 
                    className="flex items-center gap-3 text-base font-medium hover:text-gray-400 transition-colors"
                    style={{ 
                      padding: "12px 16px",
                      height: "50px"
                    }}
                    onClick={handleClose}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Аккаунт
                  </LocalizedClientLink>
                </div>
              </nav>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <Button 
                className="w-full bg-[#BAFF29] hover:bg-gray-400 text-black" 
                size="large"
                onClick={handleClose}
              >
                <LocalizedClientLink href="/cart" className="w-full h-full flex items-center justify-center">
                  Корзина
                </LocalizedClientLink>
              </Button>
            </div>
          </div>
        )}

        {activeModal === 'catalog' && (
          <div className="h-full flex flex-col">
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
                <h2 className="text-lg font-medium">Каталог</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMark className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              {loading ? (
                <div className="text-center py-8">
                  <span className="text-gray-500">Загрузка категорий...</span>
                </div>
              ) : (
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
                            onClick={handleClose}
                          >
                            <span>{category.name}</span>
                          </LocalizedClientLink>
                        )}
                      </div>
                    )
                  })}
                  
                  <div className="mt-8">
                    <LocalizedClientLink
                      href="/store"
                      className="inline-flex items-center px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black font-medium rounded-md transition-colors text-xs w-full justify-center"
                      onClick={handleClose}
                    >
                      Смотреть весь каталог
                    </LocalizedClientLink>
                  </div>
                </div>
              )}
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
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center">
                <button
                  onClick={handleBackToCatalog}
                  className="p-2 hover:bg-gray-100 rounded-full mr-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <h2 className="text-lg font-medium">{selectedCategory.name}</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMark className="w-6 h-6" />
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
                          onClick={handleClose}
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
          <div className="h-full flex flex-col">
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
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMark className="w-6 h-6" />
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
                    onClick={handleClose}
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
    </>
  )
}

// Зеленая строка с промокодом для главной страницы (только мобильная версия)
const MobilePromoBar = () => {
  return (
    <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#BAFF29] h-[40px]">
      <div className="flex items-center justify-center h-full">
        <div className="overflow-hidden whitespace-nowrap w-full">
          <div className="animate-marquee inline-block">
            <span 
              className="text-black"
              style={{ 
                fontSize: "11px",
                fontWeight: 500
              }}
            >
              дополнительная скидка -25% по промокоду ВМЕСТЕ
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export { MobileNav, MobilePromoBar } 
