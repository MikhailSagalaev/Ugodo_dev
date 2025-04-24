'use client'

import { StoreRegion } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "@medusajs/icons"

type ListRegionsProps = {
  regions: StoreRegion[]
  pathName: string
  searchParams: ReturnType<typeof useSearchParams>
}

const ListRegions = ({ regions, pathName, searchParams }: ListRegionsProps) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const currentParams = new URLSearchParams(searchParams.toString())
  const currencyCode = currentParams.get("currency_code")
  
  const currentCountryCode = pathName.split("/")[1]
  
  const { regionName, countryName } = regions.reduce((acc, region) => {
    if (region.countries.some(c => c.iso_2 === currentCountryCode)) {
      acc.regionName = region.name

      const country = region.countries.find(c => c.iso_2 === currentCountryCode)
      if (country) {
        acc.countryName = country.display_name
      }
    }
    return acc
  }, { regionName: "", countryName: "" } as { regionName: string, countryName: string })
  
  // Закрытие при клике вне выпадающего списка
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  const handleRegionChange = (countryCode: string) => {
    const newParams = new URLSearchParams(currentParams)
    
    // Получаем текущий путь без кода страны в начале
    let pathWithoutRegion = pathName.replace(/^\/[^\/]+/, "")
    
    // Если путь пустой, добавляем "/"
    if (!pathWithoutRegion) {
      pathWithoutRegion = "/"
    }
    
    const queryString = newParams.toString()
    const query = queryString ? `?${queryString}` : ""
    
    router.push(`/${countryCode}${pathWithoutRegion}${query}`)
    setIsOpen(false)
  }
  
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="flex items-center gap-x-2 hover:text-ui-fg-base"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Выбрать город"
      >
        {/* Иконка местоположения */}
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span>{countryName || regionName}</span>
        <ChevronDown className={clx("w-4 transition-transform", {
          "transform rotate-180": isOpen
        })} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-64 bg-white shadow-lg rounded-lg py-3 z-40 border border-ui-border-base">
          <h3 className="font-medium text-ui-fg-base px-4 pb-2 border-b border-ui-border-base">Выберите город</h3>
          {regions.map((region) => (
            <div key={region.id} className="px-4 py-2">
              <h4 className="text-sm font-medium text-ui-fg-base mb-1">{region.name}</h4>
              <ul className="grid grid-cols-2 gap-1">
                {region.countries.map((country) => (
                  <li key={country.iso_2}>
                    <button
                      className={clx(
                        "w-full text-left text-sm py-1 px-2 rounded hover:bg-ui-bg-base-hover",
                        {
                          "font-medium bg-ui-bg-base-hover text-ui-fg-base": country.iso_2 === currentCountryCode,
                          "text-ui-fg-subtle": country.iso_2 !== currentCountryCode
                        }
                      )}
                      onClick={() => handleRegionChange(country.iso_2)}
                    >
                      {country.display_name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListRegions 