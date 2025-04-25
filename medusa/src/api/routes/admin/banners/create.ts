import type { Request, Response } from "express"
import { CreateBannerDTO } from "../../../../modules/banner"

/**
 * @schema AdminPostBannersReq
 * type: object
 * required:
 *   - title
 *   - position
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
 *     default: true
 *     description: Активен ли баннер
 *   image_url:
 *     type: string
 *     description: URL изображения баннера
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { title, subtitle, position, active, image_url } = req.body as CreateBannerDTO
    
    const bannerService = req.scope.resolve("bannerService")
    
    // Валидация входных данных
    if (!title || !position) {
      throw new Error("Заголовок и позиция баннера обязательны")
    }
    
    const banner = await bannerService.create({
      title,
      subtitle,
      position,
      active: active !== undefined ? active : true,
      image_url
    })
    
    res.status(201).json({ banner })
  } catch (error) {
    console.error("Ошибка при создании баннера:", error)
    
    res.status(400).json({
      message: "Произошла ошибка при создании баннера",
      error: error.message
    })
  }
} 