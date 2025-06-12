"use client"

import { Banner } from ".."
import { BannerPositionEnum } from "../../types"

interface CategoryTopBannerProps {
  className?: string
  isMobile?: boolean
  children?: React.ReactNode
}

const CategoryTopBanner = ({ className = "", isMobile = false, children }: CategoryTopBannerProps) => {
  const fallback = (
    <div 
      className={`relative w-full flex items-center justify-center ${className}`}
      style={{
        height: isMobile ? '165px' : '415px',
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}
    >
      {children}
    </div>
  )

  return (
    <Banner 
      position={BannerPositionEnum.CATEGORY_TOP} 
      className={`${className}`}
      fallback={fallback}
    />
  )
}

export default CategoryTopBanner 