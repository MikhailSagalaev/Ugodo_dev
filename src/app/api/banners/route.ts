import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const position = searchParams.get("position")
  const active = searchParams.get("active")
  
  try {
    const queryParams: Record<string, any> = {}
    
    if (position) {
      queryParams.position = position
    }
    
    if (active !== null) {
      queryParams.active = active === "true"
    }
    
    const { banners } = await sdk.client.fetch<{ banners: any[] }>("/store/banners", {
      method: "GET",
      query: queryParams
    })
    
    return NextResponse.json({ banners })
  } catch (error) {
    console.error("Ошибка при получении баннеров:", error)
    
    return NextResponse.json(
      { 
        message: "Ошибка при получении баннеров",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}