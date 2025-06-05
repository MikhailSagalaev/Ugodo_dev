/**
 * @file: product-media.ts
 * @description: Модель для хранения медиафайлов товаров (image, video)
 * @created: 2024-06-13
 */

import { model } from "@medusajs/framework/utils"

const ProductMedia = model.define("product_media", {
  id: model.id().primaryKey(),
  type: model.enum(["image", "video"]),
  url: model.text(),
  product_id: model.text().index("IDX_PRODUCT_MEDIA_PRODUCT_ID"),
  title: model.text().nullable(),
  description: model.text().nullable(),
  alt_text: model.text().nullable(),
  sort_order: model.number().default(0),
  is_thumbnail: model.boolean().default(false),
  metadata: model.json().nullable(),
})

export default ProductMedia 