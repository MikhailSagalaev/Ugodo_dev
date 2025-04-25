"use client"

import { Banner } from ".."
import { BannerPositionEnum } from "../../types"

interface HomeMiddleBannerProps {
  className?: string
}

/**
 * Компонент для отображения баннера в середине главной страницы
 */
const HomeMiddleBanner = ({ className = "" }: HomeMiddleBannerProps) => {
  return (
    <Banner 
      position={BannerPositionEnum.HOME_MIDDLE} 
      className={className}
    />
  )
}

export default HomeMiddleBanner 