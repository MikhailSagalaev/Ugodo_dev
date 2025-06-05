import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /store/products/{id}/media - получить все медиафайлы товара для фронтенда
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { id: productId } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: mediaFiles } = await query.graph({
    entity: "product_media",
    fields: ["*"],
    filters: {
      product_id: productId,
    },
    pagination: {
      take: req.validatedQuery?.limit || 50,
      skip: req.validatedQuery?.offset || 0,
    },
  })

  // Разделяем по типам для удобства фронтенда
  const images = mediaFiles.filter((media: any) => String(media.type) === "image")
  const videos = mediaFiles.filter((media: any) => String(media.type) === "video")

  res.json({
    media: mediaFiles,
    images,
    videos,
    count: mediaFiles.length,
  })
} 