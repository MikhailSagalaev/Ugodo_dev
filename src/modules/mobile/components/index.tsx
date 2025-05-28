'use client'

import React, { useState } from 'react'
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button } from "@medusajs/ui"
import { XMark } from "@medusajs/icons"

type MobileNavProps = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const MobileNav = ({ isOpen, setIsOpen }: MobileNavProps) => {
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
          <div className="flex-1">
            <nav className="space-y-6">
              <ul className="space-y-4">
                <li>
                  <LocalizedClientLink 
                    href="/" 
                    className="flex items-center gap-3 text-lg font-medium hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    Главная
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/search" 
                    className="flex items-center gap-3 text-lg font-medium hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    Поиск
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/categories" 
                    className="flex items-center gap-3 text-lg font-medium hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                    Категории
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/wishlist" 
                    className="flex items-center gap-3 text-lg font-medium hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                    Избранное
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/account" 
                    className="flex items-center gap-3 text-lg font-medium hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    Аккаунт
                  </LocalizedClientLink>
                </li>
              </ul>
            </nav>
            
            <div className="mt-10 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-700">Категории</h3>
              <ul className="space-y-2">
                <li>
                  <LocalizedClientLink 
                    href="/categories/bathroom" 
                    className="block py-1 hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Для ванной
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/categories/kitchen" 
                    className="block py-1 hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Для кухни
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/categories/bedroom" 
                    className="block py-1 hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Для спальни
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink 
                    href="/categories/livingroom" 
                    className="block py-1 hover:text-violet-600 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Для гостиной
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom part */}
          <div className="pt-6 border-t border-gray-200 mt-6">
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