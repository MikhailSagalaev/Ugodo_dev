import { NextRequest, NextResponse } from "next/server"
import { BannerService, CreateBannerDTO, UpdateBannerDTO } from "@modules/banner"
import { container } from "@modules/common/container"

// Получение сервиса баннеров
const bannerService = container.resolve(BannerService)

// GET /api/admin/banners - получить все баннеры
export async function GET() {
  try {
    const banners = await bannerService.list()
    return NextResponse.json(banners)
  } catch (error) {
    console.error("Ошибка при получении баннеров:", error)
    return NextResponse.json(
      { error: "Не удалось получить баннеры" },
      { status: 500 }
    )
  }
}

// POST /api/admin/banners - создать новый баннер
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as CreateBannerDTO
    
    // Валидация обязательных полей
    if (!body.title || !body.image_url) {
      return NextResponse.json(
        { error: "Название и URL изображения обязательны" },
        { status: 400 }
      )
    }
    
    const banner = await bannerService.create(body)
    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error("Ошибка при создании баннера:", error)
    return NextResponse.json(
      { error: "Не удалось создать баннер" },
      { status: 500 }
    )
  }
} 