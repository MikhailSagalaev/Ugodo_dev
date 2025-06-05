import { MedusaService } from "@medusajs/framework/utils"
import ProductVideo from "./models/product-video"
import { VideoType } from "./types"

class ProductVideoModuleService extends MedusaService({
  ProductVideo,
}) {
  
  constructor() {
    super(...arguments)
  }
  
  async getVideosByProductId(productId: string) {
    return await this.listProductVideoes({
      product_id: productId
    })
  }

  async createVideoForProduct(productId: string, videoData: {
    fileId: string
    filename: string
    mimeType: string
    size: number
    url: string
    type?: VideoType
    title?: string
    description?: string
    thumbnail_url?: string
    duration?: number
  }) {
    const video = await this.createProductVideoes([{
      product_id: productId,
      type: videoData.type || VideoType.MAIN,
      fileId: videoData.fileId,
      filename: videoData.filename,
      mimeType: videoData.mimeType,
      size: videoData.size,
      url: videoData.url,
      title: videoData.title,
      description: videoData.description,
      thumbnail_url: videoData.thumbnail_url,
      duration: videoData.duration
    }])
    
    return video[0] // Returns array, get first element
  }

  async deleteVideoById(videoId: string) {
    return await this.deleteProductVideoes([videoId])
  }

  async updateVideo(videoId: string, updateData: Partial<{
    title: string
    description: string
    type: VideoType
  }>) {
    const updated = await this.updateProductVideoes([{
      id: videoId,
      ...updateData
    }])
    return updated[0] // Returns array, get first element
  }
}

export default ProductVideoModuleService 