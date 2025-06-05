import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_VIDEO_MODULE } from "../../../../modules/product-video"
import ProductVideoModuleService from "../../../../modules/product-video/service"

type VideoParams = {
  id: string
}

type UpdateVideoBody = {
  title?: string
  description?: string
  type?: string
}

// GET /admin/product-videos/{id} - Get video by ID
export const GET = async (req: MedusaRequest<{}, VideoParams>, res: MedusaResponse) => {
  const { id: videoId } = req.params

  try {
    const productVideoService: ProductVideoModuleService = req.scope.resolve(PRODUCT_VIDEO_MODULE)
    const videos = await productVideoService.listProductVideoes({ id: videoId })
    
    if (!videos.length) {
      return res.status(404).json({ 
        error: "Видео не найдено" 
      })
    }

    res.json({
      video: videos[0]
    })
  } catch (error) {
    console.error("Error fetching video:", error)
    res.status(500).json({ 
      error: "Ошибка при получении видео" 
    })
  }
}

// PUT /admin/product-videos/{id} - Update video
export const PUT = async (req: MedusaRequest<UpdateVideoBody, VideoParams>, res: MedusaResponse) => {
  const { id: videoId } = req.params
  const { title, description, type } = req.body

  try {
    const productVideoService: ProductVideoModuleService = req.scope.resolve(PRODUCT_VIDEO_MODULE)
    
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type

    const updatedVideo = await productVideoService.updateVideo(videoId, updateData)

    res.json({
      video: updatedVideo,
      message: "Видео успешно обновлено"
    })
  } catch (error) {
    console.error("Error updating video:", error)
    res.status(500).json({ 
      error: "Ошибка при обновлении видео" 
    })
  }
}

// DELETE /admin/product-videos/{id} - Delete video
export const DELETE = async (req: MedusaRequest<{}, VideoParams>, res: MedusaResponse) => {
  const { id: videoId } = req.params

  try {
    const productVideoService: ProductVideoModuleService = req.scope.resolve(PRODUCT_VIDEO_MODULE)
    
    await productVideoService.deleteVideoById(videoId)

    res.json({
      message: "Видео успешно удалено"
    })
  } catch (error) {
    console.error("Error deleting video:", error)
    res.status(500).json({ 
      error: "Ошибка при удалении видео" 
    })
  }
} 