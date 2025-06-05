import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_VIDEO_MODULE } from "../../../modules/product-video"
import ProductVideoModuleService from "../../../modules/product-video/service"

type GetVideosQuery = {
  product_id?: string
}

// GET /admin/product-videos - Get videos by product_id
export const GET = async (req: MedusaRequest<GetVideosQuery>, res: MedusaResponse) => {
  const { product_id } = req.query

  if (!product_id) {
    return res.status(400).json({ 
      error: "product_id обязателен" 
    })
  }

  try {
    const productVideoService: ProductVideoModuleService = req.scope.resolve(PRODUCT_VIDEO_MODULE)
    const videos = await productVideoService.getVideosByProductId(product_id as string)

    res.json({
      videos
    })
  } catch (error) {
    console.error("Error fetching videos:", error)
    res.status(500).json({ 
      error: "Ошибка при получении видео" 
    })
  }
} 