"use client"

import { Banner } from ".."
import { BannerPositionEnum } from "../../types"

interface HomeTopBannerProps {
  className?: string
}

/**
 * Компонент для отображения баннера в верхней части главной страницы
 */
const HomeTopBanner = ({ className = "" }: HomeTopBannerProps) => {
  return (
    <Banner 
      position={BannerPositionEnum.HOME_TOP} 
      className={className}
    />
  )
}

export default HomeTopBanner 