import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import { PRODUCT_MEDIA_MODULE } from "../modules/product-media"

export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    field: "id",
  },
  {
    linkable: {
      serviceName: PRODUCT_MEDIA_MODULE,
      alias: "media",
      primaryKey: "id",
    },
    field: "product_id",
    isList: true,
  },
  {
    readOnly: true,
  }
) 