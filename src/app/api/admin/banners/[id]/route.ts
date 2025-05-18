import { NextRequest, NextResponse } from "next/server"
import { BannerService, UpdateBannerDTO } from "@modules/banner"
import { container } from "@modules/common/container"

// Получение сервиса баннеров
const bannerService = container.resolve(BannerService)

// GET /api/admin/banners/[id] - получить баннер по ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const banner = await bannerService.retrieve(params.id)
    return NextResponse.json(banner)
  } catch (error) {
    console.error(`Ошибка при получении баннера с ID ${params.id}:`, error)
    return NextResponse.json(
      { error: "Баннер не найден" },
      { status: 404 }
    )
  }
}

// PUT /api/admin/banners/[id] - обновить баннер
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json() as UpdateBannerDTO
    const banner = await bannerService.update(params.id, body)
    return NextResponse.json(banner)
  } catch (error) {
    console.error(`Ошибка при обновлении баннера с ID ${params.id}:`, error)
    return NextResponse.json(
      { error: "Не удалось обновить баннер" },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/banners/[id] - удалить баннер
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await bannerService.delete(params.id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error(`Ошибка при удалении баннера с ID ${params.id}:`, error)
    return NextResponse.json(
      { error: "Не удалось удалить баннер" },
      { status: 500 }
    )
  }
} 