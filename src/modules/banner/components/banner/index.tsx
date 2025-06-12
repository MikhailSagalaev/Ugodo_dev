"use client"

import { useState, useEffect } from 'react'
import { Heading, Text, Button } from "@medusajs/ui"
import { BannerPositionEnum, BannerType } from "../../types"
import SafeImage from "@modules/common/components/safe-image"

interface BannerProps {
  position: BannerPositionEnum
  className?: string
  fallback?: React.ReactNode
}

const Banner = ({ position, className = '', fallback }: BannerProps) => {
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
    if (position === BannerPositionEnum.CATEGORY_TOP) {
      return fallback || null
    }
    return (
      <div className={`w-full max-w-[1415px] mx-auto bg-gray-100 animate-pulse ${className}`} style={{ borderRadius: '48px', height: '433px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Загрузка баннера...</div>
        </div>
      </div>
    )
  }

  if (error || !banner || !banner.image_url) {
    return fallback || null
  }

  const isCategory = position === BannerPositionEnum.CATEGORY_TOP
  const bannerStyle = isCategory 
    ? { width: '100%', height: '100%' }
    : { borderRadius: '48px', height: '433px' }

  return (
    <div className={`relative w-full ${isCategory ? 'h-full' : 'max-w-[1415px] mx-auto'} overflow-hidden ${className}`} style={bannerStyle}>
      <div className="relative w-full h-full">
        <SafeImage
          src={banner.image_url}
          alt={banner.title}
          fill
          style={{ objectFit: "cover" }}
          priority={position === BannerPositionEnum.HOME_TOP}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
        />
      </div>
    </div>
  )
}

export default Banner 