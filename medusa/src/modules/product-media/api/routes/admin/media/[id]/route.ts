import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { PRODUCT_MEDIA_MODULE } from "../../../../../index"
import ProductMediaModuleService from "../../../../../service"

// DELETE /admin/media/{id} - удалить медиафайл
export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params

  const productMediaService: ProductMediaModuleService = req.scope.resolve(
    PRODUCT_MEDIA_MODULE
  )

  try {
    await productMediaService.deleteProductMedia(id)
    res.status(200).json({
      deleted: true,
      id,
    })
  } catch (error) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Media file with id ${id} not found`
    )
  }
} 