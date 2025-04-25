import { NextRequest, NextResponse } from "next/server"
import { medusaClient } from "@lib/config"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const position = searchParams.get("position")
  
  if (!position) {
    return NextResponse.json(
      { message: "Не указана позиция баннера" },
      { status: 400 }
    )
  }
  
  try {
    // Запрашиваем баннеры с указанной позицией и флагом active=true
    const { data } = await medusaClient.client.request("GET", "/store/banners", {
      query: {
        position,
        active: "true"
      }
    })
    
    // Если баннеры найдены, возвращаем первый (активный для указанной позиции)
    if (data.banners && data.banners.length > 0) {
      return NextResponse.json({ banner: data.banners[0] })
    }
    
    // Если баннеры не найдены, возвращаем пустой объект
    return NextResponse.json({ banner: null })
  } catch (error) {
    console.error(`Ошибка при получении баннера для позиции ${position}:`, error)
    
    return NextResponse.json(
      { 
        message: "Ошибка при получении баннера",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
} 