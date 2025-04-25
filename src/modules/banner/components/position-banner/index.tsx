"use client"

import Banner from "../banner"
import { BannerPositionEnum } from "../../types"

interface PositionBannerProps {
  position: BannerPositionEnum
  className?: string
}

/**
 * Компонент для отображения баннера в определенной позиции
 */
const PositionBanner: React.FC<PositionBannerProps> = ({ position, className }) => {
  return <Banner position={position} className={className} />
}

export default PositionBanner 