import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")
  
  try {
    if (!q) {
      return NextResponse.json({ products: [] })
    }

    const apiUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const apiKey = process.env.NEXT_PUBLIC_MEDUSA_API_KEY || "pk_c7d203b4eb02900c90763acebc5dbd649264953d2dc849de6424c65aae8614cf" 
    
    // Выполняем поиск продуктов напрямую через fetch
    const response = await fetch(
      `${apiUrl}/store/products?q=${encodeURIComponent(q)}&limit=10`,
      {
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "x-publishable-api-key": apiKey
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`API вернул статус ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json({ products: data.products })
  } catch (error) {
    console.error("Ошибка при поиске продуктов:", error)
    return NextResponse.json({ products: [] }, { status: 200 })
  }
} 