/**
 * @file: product-media.ts
 * @description: Модель для хранения медиафайлов товаров (image, video)
 * @created: 2024-06-13
 */

import { model } from "@medusajs/framework/utils"
import { MediaType } from "../types/media-type"

const ProductMedia = model.define("product_media", {
  id: model.id().primaryKey(),
  type: model.enum(MediaType),
  url: model.text(),
  product_id: model.text().index("IDX_PRODUCT_MEDIA_PRODUCT_ID"),
  title: model.text().nullable(),
  metadata: model.json().nullable(),
})

export default ProductMedia 