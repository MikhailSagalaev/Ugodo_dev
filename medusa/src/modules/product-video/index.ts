import ProductVideoModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const PRODUCT_VIDEO_MODULE = "product_video"

export default Module(PRODUCT_VIDEO_MODULE, {
  service: ProductVideoModuleService,
}) 