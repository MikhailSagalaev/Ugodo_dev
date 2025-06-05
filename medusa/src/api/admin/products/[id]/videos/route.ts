import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_VIDEO_MODULE } from "../../../../../modules/product-video"
import ProductVideoModuleService from "../../../../../modules/product-video/service"

type ProductVideoParams = {
  id: string
}

// GET /admin/products/{id}/videos - List videos for a product
export const GET = async (req: MedusaRequest<{}, ProductVideoParams>, res: MedusaResponse) => {
  const { id: product_id } = req.params

  try {
    const productVideoService: ProductVideoModuleService = req.scope.resolve(PRODUCT_VIDEO_MODULE)
    const videos = await productVideoService.getVideosByProductId(product_id)

    res.json({
      videos,
      count: videos.length
    })
  } catch (error) {
    console.error("Error fetching videos:", error)
    res.status(500).json({ 
      error: "Ошибка при получении видео товара" 
    })
  }
}

// DELETE /admin/products/{id}/videos - Delete all videos for a product
export const DELETE = async (req: MedusaRequest<{}, ProductVideoParams>, res: MedusaResponse) => {
  const { id: product_id } = req.params

  try {
    const productVideoService: ProductVideoModuleService = req.scope.resolve(PRODUCT_VIDEO_MODULE)
    const videos = await productVideoService.getVideosByProductId(product_id)
    
    // Delete all videos for this product
    for (const video of videos) {
      await productVideoService.deleteVideoById(video.id)
    }

    res.json({
      message: `Удалено ${videos.length} видео для товара ${product_id}`
    })
  } catch (error) {
    console.error("Error deleting videos:", error)
    res.status(500).json({ 
      error: "Ошибка при удалении видео товара" 
    })
  }
} 