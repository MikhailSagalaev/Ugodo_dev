"use client"

import { Banner } from ".."
import { BannerPositionEnum } from "../../types"

interface ProductRelatedBannerProps {
  className?: string
}

/**
 * Компонент для отображения баннера в разделе связанных продуктов
 */
const ProductRelatedBanner = ({ className = "" }: ProductRelatedBannerProps) => {
  return (
    <Banner 
      position={BannerPositionEnum.PRODUCT_RELATED} 
      className={className}
    />
  )
}

export default ProductRelatedBanner 