import { 
  createStep, 
  createWorkflow, 
  StepResponse, 
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"
import { PRODUCT_MEDIA_MODULE } from "../modules/product-media"
import ProductMediaModuleService from "../modules/product-media/service"

type UploadProductMediaWorkflowInput = {
  files: Array<{
    filename: string
    mimeType: string
    content: string
    access: "public" | "private"
  }>
  product_id: string
  type: "image" | "video"
}

// Step 1: Upload files to storage
const uploadFilesStep = createStep(
  "upload-product-media-files",
  async ({ files }: { files: UploadProductMediaWorkflowInput["files"] }, { container }) => {
    const { result } = await uploadFilesWorkflow(container).run({
      input: { files }
    })

    return new StepResponse(result, result)
  },
  async (uploadedFiles, { container }) => {
    // Rollback: delete uploaded files if something goes wrong
    // Note: In real implementation, you'd use deleteFilesWorkflow here
    console.log("Rolling back uploaded files:", uploadedFiles?.map(f => f.url))
  }
)

// Step 2: Save media records to database
const saveMediaRecordsStep = createStep(
  "save-product-media-records",
  async ({ 
    uploadedFiles, 
    product_id, 
    type, 
    originalFiles 
  }: {
    uploadedFiles: any[]
    product_id: string
    type: "image" | "video"
    originalFiles: UploadProductMediaWorkflowInput["files"]
  }, { container }) => {
    const productMediaService: ProductMediaModuleService = container.resolve(
      PRODUCT_MEDIA_MODULE
    )

    const mediaRecords = await Promise.all(
      uploadedFiles.map(async (uploadedFile, index) => {
        const originalFile = originalFiles[index]
        return await productMediaService.createProductMedia({
          type,
          url: uploadedFile.url,
          product_id,
          metadata: {
            filename: originalFile.filename,
            mimeType: originalFile.mimeType,
            size: originalFile.content.length, // approximation
          },
        })
      })
    )

    return new StepResponse(mediaRecords, mediaRecords)
  },
  async (mediaRecords, { container }) => {
    // Rollback: delete database records
    if (mediaRecords && Array.isArray(mediaRecords)) {
      const productMediaService: ProductMediaModuleService = container.resolve(
        PRODUCT_MEDIA_MODULE
      )

      await Promise.all(
        mediaRecords.map(recordArray => {
          // recordArray is an array from createProductMedia, get first element
          const record = Array.isArray(recordArray) ? recordArray[0] : recordArray
          return productMediaService.deleteProductMedia(record.id)
        })
      )
    }
  }
)

export const uploadProductMediaWorkflow = createWorkflow(
  "upload-product-media",
  ({ files, product_id, type }: UploadProductMediaWorkflowInput) => {
    // Step 1: Upload files to storage
    const uploadedFiles = uploadFilesStep({ files })

    // Step 2: Save records to database
    const mediaRecords = saveMediaRecordsStep({
      uploadedFiles,
      product_id,
      type,
      originalFiles: files
    })

    return new WorkflowResponse({
      uploaded_files: uploadedFiles,
      media_records: mediaRecords
    })
  }
) 