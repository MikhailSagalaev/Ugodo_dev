import { defineLink } from "@medusajs/framework/utils"
import { linkable as ProductMediaLinkable } from "../modules/product-media"
import ProductModule from "@medusajs/product"

export default defineLink(
  ProductModule.linkable.product,
  ProductMediaLinkable.productMedia
) 