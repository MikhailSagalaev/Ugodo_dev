import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BANNER_MODULE } from "../../../modules/banner"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const bannerModuleService = req.scope.resolve(BANNER_MODULE)
  
  const limit = parseInt(req.query?.limit as string) || 10
  const offset = parseInt(req.query?.offset as string) || 0
  
  try {
    const [banners, count] = await Promise.all([
      bannerModuleService.listBanners({}, {
        limit,
        offset,
      }),
      bannerModuleService.countBanners({}),
    ])
    
    res.json({
      banners,
      count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Ошибка при получении баннеров:", error)
    res.status(500).json({
      message: "Не удалось получить баннеры",
      error: error.message,
    })
  }
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const bannerModuleService = req.scope.resolve(BANNER_MODULE)
  
  try {
    const banner = await bannerModuleService.createBanners(req.body)
    
    res.status(201).json(banner)
  } catch (error) {
    console.error("Ошибка при создании баннера:", error)
    res.status(500).json({
      message: "Не удалось создать баннер",
      error: error.message,
    })
  }
} 