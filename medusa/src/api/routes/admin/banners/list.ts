import type { Request, Response } from "express"
import { MedusaError } from "@medusajs/utils"

/**
 * @schema AdminBannersListRes
 * type: object
 * properties:
 *   banners:
 *     type: array
 *     items:
 *       $ref: "#/components/schemas/Banner"
 */
export async function list(req: Request, res: Response): Promise<void> {
  try {
    const bannerService = req.scope.resolve("bannerService")
    
    // Получаем параметры фильтрации из запроса
    const { position, active } = req.query
    
    const selector: any = {}
    
    if (position) {
      selector.position = position
    }
    
    if (active !== undefined) {
      selector.active = active === "true"
    }
    
    const banners = await bannerService.list(selector)
    
    res.status(200).json({ banners })
  } catch (error) {
    console.error("Ошибка при получении списка баннеров:", error)
    
    res.status(400).json({
      message: "Произошла ошибка при получении списка баннеров",
      error: error.message
    })
  }
} 