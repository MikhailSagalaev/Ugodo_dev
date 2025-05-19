'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { Loader2 } from "lucide-react"
import { clx } from "@medusajs/ui"

// Интерфейс для товара
interface Product {
  id: string
  title: string
  handle: string
  thumbnail: string
  status: string
  variants: {
    calculated_price: number
    currency_code: string
  }[]
}

interface SearchProps {
  isScrolled?: boolean
}

const Search = ({ isScrolled = false }: SearchProps) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchTimeout = useRef<NodeJS.Timeout | null>(null)
  
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
  
  // Поиск товаров при вводе
  const searchProducts = async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([])
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.products || [])
      }
    } catch (error) {
      console.error('Ошибка при поиске товаров:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Обработка изменения ввода с задержкой
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    // Отменяем предыдущий таймер если он есть
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }
    
    // Создаем новый таймер
    searchTimeout.current = setTimeout(() => {
      searchProducts(value)
    }, 300)
  }
  
  return (
    <div ref={searchRef} className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-full h-full"
        aria-label="Поиск"
      >
        <svg 
          width="22" 
          height="22" 
          viewBox="0 0 22 22" 
          fill="none" 
          stroke={!isScrolled ? "white" : "black"}
          className={clx("transition-colors duration-200 group-hover:stroke-black hover:stroke-[#C2E7DA]")}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="1.5" 
            d="M19.25 19.25l-5.5-5.5m1.8-4.6a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-96 bg-white shadow-lg rounded-lg p-4 z-40 border border-ui-border-base">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Что вы ищете?"
              className="w-full px-4 py-2 border border-ui-border-base rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              autoFocus
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black"
              aria-label="Искать"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
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
                    strokeWidth="1.5" 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              )}
            </button>
          </form>
          
          {/* Результаты поиска */}
          {query.length > 1 && (
            <div className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-8 h-8 animate-spin text-black opacity-70" />
                </div>
              ) : results.length > 0 ? (
                <div className="max-h-80 overflow-y-auto">
                  <h3 className="text-black text-sm font-medium mb-2">Результаты поиска</h3>
                  <ul className="space-y-2">
                    {results.map((product) => (
                      <li key={product.id}>
                        <LocalizedClientLink 
                          href={`/products/${product.handle}`}
                          className="flex items-center gap-3 p-2 hover:bg-ui-bg-base-hover rounded-lg transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="w-12 h-12 relative flex-shrink-0 bg-ui-bg-subtle rounded">
                            {product.thumbnail ? (
                              <Image
                                src={product.thumbnail}
                                alt={product.title}
                                fill
                                sizes="48px"
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-black opacity-70">
                                <svg 
                                  className="w-6 h-6" 
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24" 
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" strokeWidth="1.5" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 14s1.5 2 4 2 4-2 4-2" />
                                  <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
                                  <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-black truncate">{product.title}</p>
                            {product.variants && product.variants[0] && (
                              <p className="text-xs text-black opacity-70">
                                {convertToLocale({
                                  amount: product.variants[0].calculated_price,
                                  currency_code: product.variants[0].currency_code,
                                })}
                              </p>
                            )}
                          </div>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : query.length >= 2 && (
                <div className="py-4 text-center text-black opacity-70">
                  <p className="text-sm">Товары не найдены</p>
                  <p className="text-xs mt-1">Попробуйте изменить запрос</p>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-3 text-xs text-black opacity-70">
            <p>Нажмите <kbd className="px-1.5 py-0.5 bg-ui-bg-subtle rounded">Enter</kbd> для поиска</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Search 