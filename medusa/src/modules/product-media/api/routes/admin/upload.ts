import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import ProductMediaModuleService from "../../../service"
import { PRODUCT_MEDIA_MODULE } from "../../../index"

interface UploadRequest extends MedusaRequest {
  files?: Array<{
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    buffer: Buffer
  }>
  body: {
    type: "image" | "video"
  }
}

export async function POST(
  req: UploadRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const files = req.files
  const { type } = req.body

  if (!files?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded"
    )
  }

  if (!type || !["image", "video"].includes(type)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Type must be either 'image' or 'video'"
    )
  }

  // Validate file types based on media type
  const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  const validVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"]

  for (const file of files) {
    if (type === "image" && !validImageTypes.includes(file.mimetype)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid image file type: ${file.mimetype}. Allowed types: ${validImageTypes.join(", ")}`
      )
    }
    
    if (type === "video" && !validVideoTypes.includes(file.mimetype)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid video file type: ${file.mimetype}. Allowed types: ${validVideoTypes.join(", ")}`
      )
    }
  }

  try {
    // Upload files using Medusa's file workflow
    const { result } = await uploadFilesWorkflow(req.scope).run({
      input: {
        files: files.map((file) => ({
          filename: file.originalname,
          mimeType: file.mimetype,
          content: file.buffer.toString("binary"),
          access: "public",
        })),
      },
    })

    // Get the product media service
    const productMediaService: ProductMediaModuleService = req.scope.resolve(
      PRODUCT_MEDIA_MODULE
    )

    // Create product media records for each uploaded file
    const productMediaRecords = await Promise.all(
      result.map(async (uploadedFile, index) => {
        const originalFile = files[index]
        return await productMediaService.createProductMedia({
          type: type,
          url: uploadedFile.url,
          product_id: productId,
          metadata: {
            filename: originalFile.originalname,
            mimeType: originalFile.mimetype,
            size: originalFile.size,
          },
        })
      })
    )

    res.status(201).json({
      message: `${type}s uploaded successfully`,
      data: productMediaRecords,
      uploaded_files: result,
    })
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to upload ${type}s: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
} 