"use client"

import { useState, useEffect } from 'react'
import { Heading, Text, Button } from "@medusajs/ui"
import { BannerPositionEnum, BannerType } from "../../types"
import SafeImage from "@modules/common/components/safe-image"

interface BannerProps {
  position: BannerPositionEnum
  className?: string
}

const Banner = ({ position, className = '' }: BannerProps) => {
  const [banner, setBanner] = useState<BannerType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/banners?position=${position}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setBanner(data.banner)
      } catch (err) {
        console.error('Ошибка загрузки баннера:', err)
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [position])

  if (loading) {
    return (
      <div className={`w-full h-[300px] bg-gray-100 animate-pulse rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Загрузка баннера...</div>
        </div>
      </div>
    )
  }

  if (error || !banner) {
    return null
  }

  return (
    <div className={`relative w-full overflow-hidden rounded-lg ${className}`}>
      {banner.image_url ? (
        <div className="relative w-full h-[300px]">
          <SafeImage
            src={banner.image_url}
            alt={banner.title}
            fill
            style={{ objectFit: "cover" }}
            priority={position === BannerPositionEnum.HOME_TOP}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
          />
          
          <div className="absolute inset-0 bg-black/30 p-6 flex flex-col justify-center text-white">
            <Heading level="h2" className="text-2xl md:text-3xl font-bold mb-2">
              {banner.title}
            </Heading>
          
            {banner.subtitle && (
              <Text className="text-sm md:text-base mb-4">
                {banner.subtitle}
              </Text>
            )}
          
            <div>
              <Button 
                variant="secondary"
                className="mt-4 bg-white text-black hover:bg-gray-100"
              >
                Подробнее
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center">
          <div className="text-center p-6">
            <Heading level="h2" className="text-2xl md:text-3xl font-bold mb-2">
              {banner.title}
            </Heading>
            
            {banner.subtitle && (
              <Text className="text-sm md:text-base mb-4">
                {banner.subtitle}
              </Text>
            )}
            
            <Button 
              variant="secondary"
              className="mt-4"
            >
              Подробнее
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Banner 