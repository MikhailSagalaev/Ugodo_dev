"use client"

import { RadioGroup } from "@medusajs/ui"
import { useState } from "react"
import { ChevronDown } from "lucide-react"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: SortOptions) => void
  "data-testid"?: string
}

// Переведенные варианты сортировки
const sortOptions = [
  {
    value: "created_at",
    label: "Новинки",
  },
  {
    value: "price_asc",
    label: "Цена: по возрастанию",
  },
  {
    value: "price_desc",
    label: "Цена: по убыванию",
  },
]

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const handleChange = (value: SortOptions) => {
    setQueryParams("sortBy", value)
    setDropdownOpen(false)
  }

  // Получаем текущую метку сортировки
  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || "Сортировка"
  
  // Состояние для выпадающего списка на мобильных устройствах
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 pb-4">
      <h3 className="text-base font-medium text-gray-800 mb-3 hidden md:block">Сортировка</h3>
      
      {/* Мобильная версия с выпадающим списком */}
      <div className="md:hidden">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-between w-full py-2 px-3 border border-gray-300 rounded-md bg-white text-sm"
        >
          <span>{currentSortLabel}</span>
          <ChevronDown size={16} className={dropdownOpen ? "transform rotate-180" : ""} />
        </button>
        
        {dropdownOpen && (
          <div className="absolute z-20 mt-1 bg-white border border-gray-200 shadow-lg rounded-md w-64 py-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sortBy === option.value ? 'bg-gray-50 font-medium' : ''}`}
                onClick={() => handleChange(option.value as SortOptions)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Десктопная версия с радиокнопками */}
      <div className="hidden md:block">
        <RadioGroup value={sortBy} onValueChange={handleChange}>
          {sortOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2 mb-2">
              <RadioGroup.Item 
                id={`sort-${option.value}`} 
                value={option.value} 
              />
              <label 
                htmlFor={`sort-${option.value}`} 
                className="text-sm"
              >
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}

export default SortProducts
