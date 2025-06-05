import ProductMediaModuleService from "./service"
import { Module } from "@medusajs/framework/utils"
import ProductMedia from "./models/product-media"

export const PRODUCT_MEDIA_MODULE = "productMedia"

export default Module(PRODUCT_MEDIA_MODULE, {
  service: ProductMediaModuleService,
})

export const linkable = {
  productMedia: ProductMedia,
}

export { ProductMedia } 