import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import ProductMediaModuleService from "../../../service"
import { PRODUCT_MEDIA_MODULE } from "../../../index"

interface ListRequest extends MedusaRequest {
  query: {
    type?: "image" | "video"
    limit?: string
    offset?: string
  }
}

export async function GET(
  req: ListRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: productId } = req.params
  const { type, limit = "50", offset = "0" } = req.query

  if (!productId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Product ID is required"
    )
  }

  try {
    // Get the product media service
    const productMediaService: ProductMediaModuleService = req.scope.resolve(
      PRODUCT_MEDIA_MODULE
    )

    // Get media files for the product
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