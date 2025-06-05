import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { PRODUCT_MEDIA_MODULE } from "../../../../../../index"
import ProductMediaModuleService from "../../../../../../service"

interface MulterRequest extends AuthenticatedMedusaRequest {
  files?: any[]
}

// GET /admin/products/{id}/media - получить все медиафайлы товара
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id: productId } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: mediaFiles, metadata } = await query.graph({
    entity: "product_media",
    fields: ["*"],
    filters: {
      product_id: productId,
    },
    pagination: {
      take: req.validatedQuery?.limit || 20,
      skip: req.validatedQuery?.offset || 0,
    },
  })

  res.json({
    media: mediaFiles,
    count: metadata?.count || 0,
    limit: metadata?.take || 20,
    offset: metadata?.skip || 0,
  })
}

// POST /admin/products/{id}/media - загрузить медиафайлы для товара
export const POST = async (
  req: MulterRequest,
  res: MedusaResponse
) => {
  const { id: productId } = req.params
  const files = req.files || []

  if (!files?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded"
    )
  }

  const productMediaService: ProductMediaModuleService = req.scope.resolve(
    PRODUCT_MEDIA_MODULE
  )

  // Загружаем файлы через uploadFilesWorkflow
  const { result: uploadResult } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: files.map((file) => ({
        filename: file.originalname,
        mimeType: file.mimetype,
        content: file.buffer.toString("binary"),
        access: "public",
      })),
    },
  })

  // Создаем записи в product_media для каждого файла
  const mediaRecords = await Promise.all(
    uploadResult.map(async (uploadedFile, index) => {
      const file = files[index]
      const mediaType = file.mimetype.startsWith("video/") ? "video" : "image"

      return await productMediaService.createProductMedia({
        type: mediaType,
        url: uploadedFile.url,
        product_id: productId,
        title: file.originalname,
        metadata: {
          file_id: uploadedFile.id,
          mime_type: file.mimetype,
          size: file.size,
        },
      })
    })
  )

  res.status(201).json({
    media: mediaRecords,
  })
} 