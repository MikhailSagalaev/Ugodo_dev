import { model } from "@medusajs/framework/utils"
import { VideoType } from "../types"

const ProductVideo = model.define("product_video", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  type: model.enum(VideoType),
  fileId: model.text(),
  filename: model.text(),
  mimeType: model.text(),
  size: model.number(),
  title: model.text().nullable(),
  description: model.text().nullable(),
  url: model.text(),
  thumbnail_url: model.text().nullable(),
  duration: model.number().nullable(),
})

export default ProductVideo 