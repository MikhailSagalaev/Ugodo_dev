import { NextRequest, NextResponse } from "next/server"
import { BannerService, BannerPositionEnum } from "@modules/banner"
import { container } from "@modules/common/container"

// Получение сервиса баннеров
const bannerService = container.resolve(BannerService)

// GET /api/store/banners - получить активные баннеры
// Можно фильтровать по позиции: /api/store/banners?position=home_top
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const position = url.searchParams.get("position") as BannerPositionEnum | null
    
    const selector = { 
      active: true,
      ...(position && { position })
    }
    
    const banners = await bannerService.list(selector)
    
    return NextResponse.json(banners)
  } catch (error) {
    console.error("Ошибка при получении баннеров:", error)
    return NextResponse.json(
      { error: "Не удалось получить баннеры" },
      { status: 500 }
    )
  }
} 