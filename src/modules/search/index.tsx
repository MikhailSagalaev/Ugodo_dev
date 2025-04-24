'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

const Search = () => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Закрытие при клике вне компонента поиска
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Обработка отправки формы поиска
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim()) return
    
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
  }
  
  return (
    <div ref={searchRef} className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center hover:text-ui-fg-base"
        aria-label="Поиск"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white shadow-lg rounded-lg p-4 z-40 border border-ui-border-base">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Что вы ищете?"
              className="w-full px-4 py-2 border border-ui-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-ui-fg-subtle hover:text-ui-fg-base"
              aria-label="Искать"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>
          
          <div className="mt-3 text-xs text-ui-fg-subtle">
            <p>Нажмите <kbd className="px-1.5 py-0.5 bg-ui-bg-subtle rounded">Enter</kbd> для поиска</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Search 