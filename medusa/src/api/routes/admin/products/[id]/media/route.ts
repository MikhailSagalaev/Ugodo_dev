import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_MEDIA_MODULE } from "../../../../../../modules/product-media/index"
import ProductMediaModuleService from "../../../../../../modules/product-media/service"
import { uploadProductMediaWorkflow } from "../../../../../../workflows/upload-product-media"

interface MulterRequest extends AuthenticatedMedusaRequest {
  files?: any[]
}

interface MediaUploadRequest extends MulterRequest {
  body: {
    type: "image" | "video"
  }
}

// POST /admin/products/:id/media - Upload media files using workflow
export async function POST(
  req: MediaUploadRequest,
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

  // Validate file types
  const validImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  const validVideoTypes = ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/mov"]

  for (const file of files) {
    if (type === "image" && !validImageTypes.includes(file.mimetype)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid image file type: ${file.mimetype}`
      )
    }
    
    if (type === "video" && !validVideoTypes.includes(file.mimetype)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid video file type: ${file.mimetype}`
      )
    }
  }

  try {
    // Use workflow for better data consistency and rollback support
    const { result } = await uploadProductMediaWorkflow(req.scope).run({
      input: {
        files: files.map((file) => ({
          filename: file.originalname,
          mimeType: file.mimetype,
          content: file.buffer.toString("binary"),
          access: "public" as const,
        })),
        product_id: productId,
        type: type,
      },
    })

    res.status(201).json({
      message: `${type}s uploaded successfully`,
      data: result.media_records,
      uploaded_files: result.uploaded_files,
    })
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to upload ${type}s: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// GET /admin/products/:id/media - Get media files
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const { type, limit = "50", offset = "0" } = req.query as {
    type?: "image" | "video"
    limit?: string
    offset?: string
  }

  try {
    const productMediaService: ProductMediaModuleService = req.scope.resolve(
      PRODUCT_MEDIA_MODULE
    )

    const productMedias = await productMediaService.getProductMedias(
      productId,
      type
    )

    // Apply pagination
    const limitNum = parseInt(limit, 10) || 50
    const offsetNum = parseInt(offset, 10) || 0
    
    const paginatedResults = productMedias.slice(offsetNum, offsetNum + limitNum)

    res.status(200).json({
      product_id: productId,
      type: type || "all",
      data: paginatedResults,
      count: paginatedResults.length,
      total: productMedias.length,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        has_more: offsetNum + limitNum < productMedias.length,
      },
    })
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to retrieve media: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
} 