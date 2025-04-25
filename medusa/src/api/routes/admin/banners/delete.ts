import type { Request, Response } from "express"
import { MedusaError } from "@medusajs/utils"

export async function _delete(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  
  try {
    const bannerService = req.scope.resolve("bannerService")
    
    // Проверяем, существует ли баннер
    await bannerService.retrieve(id)
    
    // Удаляем баннер
    await bannerService.delete(id)
    
    res.status(200).json({
      id,
      object: "banner",
      deleted: true
    })
  } catch (error) {
    console.error(`Ошибка при удалении баннера с ID ${id}:`, error)
    
    if (error.type === MedusaError.Types.NOT_FOUND) {
      res.status(404).json({
        message: `Баннер с ID ${id} не найден`,
        error: error.message
      })
    } else {
      res.status(400).json({
        message: `Произошла ошибка при удалении баннера с ID ${id}`,
        error: error.message
      })
    }
  }
} 