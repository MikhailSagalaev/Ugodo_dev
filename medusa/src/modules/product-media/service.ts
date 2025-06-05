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
    type: string
    url: string
    product_id: string
    title?: string
    metadata?: any
  }) {
    return this.create("ProductMedia", data)
  }

  /**
   * Получить список медиафайлов по product_id
   */
  async listProductMedias(product_id: string) {
    return this.list("ProductMedia", { product_id })
  }

  /**
   * Удалить медиафайл по id
   */
  async deleteProductMedia(id: string) {
    return this.delete("ProductMedia", id)
  }
}

export default ProductMediaModuleService 