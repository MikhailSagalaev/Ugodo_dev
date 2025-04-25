import type { Request, Response } from "express"
import { UpdateBannerDTO } from "../../../../modules/banner"

/**
 * @schema AdminPostBannersIdReq
 * type: object
 * properties:
 *   title:
 *     type: string
 *     description: Заголовок баннера
 *   subtitle:
 *     type: string
 *     description: Подзаголовок баннера
 *   position:
 *     type: string
 *     description: Позиция баннера на сайте
 *     enum: [HOME_TOP, HOME_MIDDLE, PRODUCT_RELATED, CATEGORY_TOP]
 *   active:
 *     type: boolean
 *     description: Активен ли баннер
 *   image_url:
 *     type: string
 *     description: URL изображения баннера
 */
export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  
  try {
    const { title, subtitle, position, active, image_url } = req.body as UpdateBannerDTO
    
    const bannerService = req.scope.resolve("bannerService")
    
    // Проверяем, существует ли баннер
    const banner = await bannerService.retrieve(id)
    
    // Формируем объект для обновления
    const updateData: UpdateBannerDTO = {}
    
    if (title !== undefined) updateData.title = title
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (position !== undefined) updateData.position = position
    if (active !== undefined) updateData.active = active
    if (image_url !== undefined) updateData.image_url = image_url
    
    // Обновляем баннер
    const updatedBanner = await bannerService.update(id, updateData)
    
    res.status(200).json({ banner: updatedBanner })
  } catch (error) {
    console.error(`Ошибка при обновлении баннера с ID ${id}:`, error)
    
    if (error.type === "not_found") {
      res.status(404).json({
        message: `Баннер с ID ${id} не найден`,
        error: error.message
      })
    } else {
      res.status(400).json({
        message: `Произошла ошибка при обновлении баннера с ID ${id}`,
        error: error.message
      })
    }
  }
} 