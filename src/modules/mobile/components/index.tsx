'use client'

import React, { useState, useEffect } from 'react'
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Text } from "@medusajs/ui"
import { XMark, ChevronDown } from "@medusajs/icons"
import { sdk } from "@lib/sdk"
import { HttpTypes } from "@medusajs/types"

type MobileNavProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

// Интерфейс для категории с возможностью отслеживать открытость (для аккордеона)
interface NavCategory extends HttpTypes.StoreProductCategory {
  isOpen?: boolean
}

const MobileNav = ({ isOpen, setIsOpen }: MobileNavProps) => {
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    if (isOpen) { // Загружаем категории только когда меню открывается
      setLoadingCategories(true)
      sdk.store.category
        .list({
          parent_category_id: null, // Получаем только корневые категории
          include_descendants_tree: true, // Включаем всех потомков
          fields: "id,name,handle,category_children", // Указываем нужные поля
        })
        .then(({ product_categories }: { product_categories: HttpTypes.StoreProductCategory[] }) => {
          setCategories(product_categories as NavCategory[])
          setLoadingCategories(false)
        })
        .catch(() => {
          setLoadingCategories(false)
          // Можно добавить обработку ошибок, например, показать сообщение
        })
    }
  }, [isOpen]) // Перезагружаем при каждом открытии (или можно оптимизировать)

  // Функция для переключения открытости подкатегорий
  const toggleCategory = (categoryId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((category) =>
        category.id === categoryId
          ? { ...category, isOpen: !category.isOpen }
          : category
      )
    )
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Mobile menu */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[270px] bg-white z-50 p-6 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button */}
        <button 
          className="absolute top-4 right-4 text-black" 
          onClick={() => setIsOpen(false)}
        >
          <XMark className="w-6 h-6" />
        </button>
        
        {/* Menu content */}
        <div className="pt-12 flex flex-col h-full">
          {/* Navigation links */}
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-4 pb-6">
              <ul className="space-y-3">
                <li>
                  <LocalizedClientLink 
                    href="/" 
                    className="flex items-center gap-3 py-2 text-base font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Главная
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/store"
                    className="flex items-center gap-3 py-2 text-base font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Каталог
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/search" 
                    className="flex items-center gap-3 py-2 text-base font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Поиск
                  </LocalizedClientLink>
                </li>
              </ul>
            </nav>
            
            <div className="pt-4 border-t border-gray-200">
              <Text className="font-semibold mb-3 text-gray-800 text-sm uppercase tracking-wide">Категории</Text>
              {loadingCategories ? (
                <Text className="text-gray-500 text-sm">Загрузка...</Text>
              ) : categories.length > 0 ? (
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <div 
                        className="flex items-center justify-between py-2 text-base font-medium text-gray-700 hover:text-violet-600 transition-colors cursor-pointer"
                        onClick={() => category.category_children && category.category_children.length > 0 ? toggleCategory(category.id) : setIsOpen(false)}
                      >
                        <LocalizedClientLink 
                          href={`/categories/${category.handle}`} 
                          className="flex-grow"
                          onClick={() => {
                            if (category.category_children && category.category_children.length > 0) {
                              // Если есть дочерние и кликаем по ссылке, не переключаем аккордеон, а переходим
                              // Но если клик был на всю строку (выше), то аккордеон переключится
                            } else {
                              setIsOpen(false); // Закрыть меню при переходе по прямой ссылке
                            }
                          }}
                        >
                          {category.name}
                        </LocalizedClientLink>
                        {category.category_children && category.category_children.length > 0 && (
                          category.isOpen ? <ChevronDown className="w-5 h-5 text-gray-500 transform rotate-180" /> : <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      {category.isOpen && category.category_children && category.category_children.length > 0 && (
                        <ul className="pl-4 mt-1 space-y-1 border-l border-gray-200 ml-2">
                          {category.category_children.map((child) => (
                            <li key={child.id}>
                              <LocalizedClientLink
                                href={`/categories/${child.handle}`}
                                className="block py-1.5 text-sm text-gray-600 hover:text-violet-600 transition-colors"
                                onClick={() => setIsOpen(false)}
                              >
                                {child.name}
                              </LocalizedClientLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <Text className="text-gray-500 text-sm">Категории не найдены.</Text>
              )}
            </div>
          </div>
          
          {/* Bottom part - Аккаунт и Корзина */}
          <div className="pt-6 border-t border-gray-200 mt-auto">
            <ul className="space-y-3 mb-4">
                <li>
                  <LocalizedClientLink 
                    href="/account" 
                    className="flex items-center gap-3 py-2 text-base font-medium text-gray-700 hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Аккаунт
                  </LocalizedClientLink>
                </li>
            </ul>
            <Button 
              className="w-full bg-[#cbf401] hover:bg-[#d8ff00] text-black" 
              size="large"
              onClick={() => setIsOpen(false)}
            >
              <LocalizedClientLink href="/cart" className="w-full h-full flex items-center justify-center">
                Корзина
              </LocalizedClientLink>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// Нижняя навигационная панель для мобильных устройств
const MobileBottomNav = () => {
  return (
    <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 py-2">
      <div className="flex justify-around items-center">
        <LocalizedClientLink 
          href="/" 
          className="flex flex-col items-center p-2"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span className="text-xs mt-1 text-gray-700">Главная</span>
        </LocalizedClientLink>
        
        <LocalizedClientLink 
          href="/search" 
          className="flex flex-col items-center p-2"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <span className="text-xs mt-1 text-gray-700">Поиск</span>
        </LocalizedClientLink>
        
        <LocalizedClientLink 
          href="/categories" 
          className="flex flex-col items-center p-2"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          <span className="text-xs mt-1 text-gray-700">Каталог</span>
        </LocalizedClientLink>
        
        <LocalizedClientLink 
          href="/wishlist" 
          className="flex flex-col items-center p-2"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
          <span className="text-xs mt-1 text-gray-700">Избранное</span>
        </LocalizedClientLink>
        
        <LocalizedClientLink 
          href="/account" 
          className="flex flex-col items-center p-2"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          <span className="text-xs mt-1 text-gray-700">Профиль</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export { MobileNav, MobileBottomNav } 