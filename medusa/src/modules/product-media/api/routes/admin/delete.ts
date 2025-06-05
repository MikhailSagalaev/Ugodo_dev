import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import ProductMediaModuleService from "../../../service"
import { PRODUCT_MEDIA_MODULE } from "../../../index"

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id: mediaId } = req.params

  if (!mediaId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Media ID is required"
    )
  }

  try {
    // Get the product media service
    const productMediaService: ProductMediaModuleService = req.scope.resolve(
      PRODUCT_MEDIA_MODULE
    )

    // Get the media record to get the file URL
    const productMedia = await productMediaService.getProductMedia(mediaId)

    if (!productMedia) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Media with ID ${mediaId} not found`
      )
    }

    // Delete the database record
    await productMediaService.deleteProductMedia(mediaId)

    res.status(200).json({
      message: `Media deleted successfully`,
      deleted_media: {
        id: mediaId,
        type: productMedia.type,
        url: productMedia.url,
      },
    })
  } catch (error) {
    if (error instanceof MedusaError) {
      throw error
    }
    
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Failed to delete media: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
} 