import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { PRODUCT_VIDEO_MODULE } from "../../../../modules/product-video"
import ProductVideoModuleService from "../../../../modules/product-video/service"

type UploadVideoBody = {
  product_id: string
  type?: string
  title?: string
  description?: string
}

export const POST = async (req: MedusaRequest<UploadVideoBody>, res: MedusaResponse) => {
  const file = (req as any).file
  
  if (!file) {
    return res.status(400).json({ 
      error: "Файл не найден" 
    })
  }

  const { product_id, type, title, description } = req.body

  if (!product_id) {
    return res.status(400).json({ 
      error: "product_id обязателен" 
    })
  }

  try {
    // Upload file using uploadFilesWorkflow
    const { result: uploadResult } = await uploadFilesWorkflow(req.scope).run({
      input: {
        files: [{
          filename: file.originalname,
          mimeType: file.mimetype,
          content: file.buffer,
          access: "public",
        }],
      },
    })

    const uploadedFile = uploadResult[0]

    // Save video info to database
    const productVideoService: ProductVideoModuleService = req.scope.resolve(PRODUCT_VIDEO_MODULE)
    
    const video = await productVideoService.createVideoForProduct(product_id, {
      fileId: uploadedFile.id,
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: uploadedFile.url,
      type: type as any,
      title,
      description
    })

    res.json({
      video,
      message: "Видео успешно загружено"
    })
  } catch (error) {
    console.error("Error uploading video:", error)
    res.status(500).json({ 
      error: "Ошибка при загрузке видео" 
    })
  }
} 