import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../../modules/banner"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const bannerModuleService = req.scope.resolve(BANNER_MODULE)
  
  try {
    const banner = await bannerModuleService.retrieveBanner(id)
    
    res.json(banner)
  } catch (error) {
    console.error(`Ошибка при получении баннера с ID ${id}:`, error)
    res.status(404).json({
      message: "Баннер не найден",
      error: error.message,
    })
  }
}

export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const bannerModuleService = req.scope.resolve(BANNER_MODULE)
  
  try {
    const banner = await bannerModuleService.updateBanners(id, req.body)
    
    res.json(banner)
  } catch (error) {
    console.error(`Ошибка при обновлении баннера с ID ${id}:`, error)
    res.status(500).json({
      message: "Не удалось обновить баннер",
      error: error.message,
    })
  }
}

export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const { id } = req.params
  const bannerModuleService = req.scope.resolve(BANNER_MODULE)
  
  try {
    await bannerModuleService.deleteBanners(id)
    
    res.status(200).json({
      id,
      object: "banner",
      deleted: true,
    })
  } catch (error) {
    console.error(`Ошибка при удалении баннера с ID ${id}:`, error)
    res.status(500).json({
      message: "Не удалось удалить баннер",
      error: error.message,
    })
  }
} 