import type { Request, Response } from "express"
import { MedusaError } from "@medusajs/utils"

/**
 * @schema AdminBannersRes
 * type: object
 * properties:
 *   banner:
 *     $ref: "#/components/schemas/Banner"
 */
export async function get(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  
  try {
    const bannerService = req.scope.resolve("bannerService")
    
    const banner = await bannerService.retrieve(id)
    
    res.status(200).json({ banner })
  } catch (error) {
    console.error(`Ошибка при получении баннера с ID ${id}:`, error)
    
    if (error.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({
        message: `Баннер с ID ${id} не найден`,
        error: error.message
      })
    } else {
      res.status(400).json({
        message: `Произошла ошибка при получении баннера с ID ${id}`,
        error: error.message
      })
    }
  }
} 