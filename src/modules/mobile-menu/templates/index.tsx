'use client'

import { useState } from "react"
import { XMark } from "@medusajs/icons"
import { MobileNav, MobileBottomNav } from "@modules/mobile/components"

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Блокируем прокрутку страницы при открытом меню
  if (typeof window !== 'undefined') {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
  
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center p-2"
        aria-label="Открыть меню"
      >
        {/* Hamburger иконка */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      
      {/* Боковое меню */}
      <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} />
      
      {/* Нижняя панель навигации */}
      <MobileBottomNav />
    </>
  )
}

export default MobileMenu 