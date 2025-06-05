/**
 * @file: service.ts
 * @description: Сервис для управления медиафайлами товаров (image, video)
 * @dependencies: ProductMedia (model)
 * @created: 2024-06-13
 */

import { MedusaService } from "@medusajs/framework/utils"
import ProductMedia from "./models/product-media"

class ProductMediaModuleService extends MedusaService({
  ProductMedia,
}) {
  /**
   * Создать медиафайл для товара
   */
  async createProductMedia(data: {
    type: "image" | "video"
    url: string
    product_id: string
    title?: string
    description?: string
    alt_text?: string
    sort_order?: number
    is_thumbnail?: boolean
    metadata?: any
  }) {
    return this.createProductMedias([data])
  }

  /**
   * Получить список медиафайлов по product_id
   */
  async getProductMedias(product_id: string, type?: "image" | "video") {
    const filters: any = { product_id }
    if (type) {
      filters.type = type
    }
    
    return this.listProductMedias(filters, {
      order: { sort_order: "ASC" }
    })
  }

  /**
   * Получить только изображения товара
   */
  async listProductImages(product_id: string) {
    return this.getProductMedias(product_id, "image")
  }

  /**
   * Получить только видео товара
   */
  async listProductVideos(product_id: string) {
    return this.getProductMedias(product_id, "video")
  }

  /**
   * Получить главное изображение товара (thumbnail)
   */
  async getProductThumbnail(product_id: string) {
    const result = await this.listProductMedias({
      product_id,
      type: "image",
      is_thumbnail: true
    })
    return result?.[0]
  }

  /**
   * Установить изображение как главное (thumbnail)
   */
  async setThumbnail(product_id: string, media_id: string) {
    // Сначала убираем thumbnail у всех изображений товара
    const existingImages = await this.listProductMedias({
      product_id,
      type: "image"
    })

    const updatePromises = existingImages.map(img => 
      this.updateProductMedias([{
        id: img.id,
        is_thumbnail: img.id === media_id
      }])
    )

    return Promise.all(updatePromises)
  }

  /**
   * Обновить порядок сортировки медиафайлов
   */
  async updateSortOrder(mediaUpdates: Array<{ id: string; sort_order: number }>) {
    return this.updateProductMedias(mediaUpdates)
  }

  /**
   * Удалить медиафайл по id
   */
  async deleteProductMedia(id: string) {
    return this.deleteProductMedias([id])
  }

  /**
   * Получить медиафайл по id
   */
  async getProductMedia(id: string) {
    return this.retrieveProductMedia(id)
  }

  /**
   * Обновить метаданные медиафайла
   */
  async updateProductMedia(id: string, data: {
    title?: string
    description?: string
    alt_text?: string
    sort_order?: number
    is_thumbnail?: boolean
    metadata?: any
  }) {
    return this.updateProductMedias([{ id, ...data }])
  }
}

export default ProductMediaModuleService 