import { Module } from "@medusajs/framework/utils"
import BannerModuleService from "./service"
import { BannerPositionEnum } from "./models/banner"

export const BANNER_MODULE = "banner"

// Экспортируем перечисление позиций баннера
export { BannerPositionEnum }

export default Module(BANNER_MODULE, {
  service: BannerModuleService,
}) 