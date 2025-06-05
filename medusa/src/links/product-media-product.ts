import { defineLink } from "@medusajs/framework/utils"
import ProductMediaModule from "../modules/product-media"
import ProductModule from "@medusajs/medusa/product"

export default defineLink(
  {
    linkable: ProductMediaModule.linkable.productMedia,
    field: "product_id",
    isList: false,
  },
  ProductModule.linkable.product,
  {
    readOnly: true,
  }
) 