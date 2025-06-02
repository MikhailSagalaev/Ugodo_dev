import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const cartId = cookieStore.get("_medusa_cart_id")?.value

    if (!cartId) {
      return NextResponse.json({ message: "Корзина не найдена" }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    
    // Получаем текущую корзину
    const cartResponse = await fetch(`${baseUrl}/store/carts/${cartId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!cartResponse.ok) {
      return NextResponse.json({ message: "Корзина не найдена" }, { status: 404 })
    }

    const cartData = await cartResponse.json()
    const cart = cartData.cart

    // Удаляем все товары из корзины
    if (cart.items && cart.items.length > 0) {
      for (const item of cart.items) {
        await fetch(`${baseUrl}/store/carts/${cartId}/line-items/${item.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
      }
    }

    return NextResponse.json({ message: "Корзина очищена" })
  } catch (error) {
    console.error("Ошибка при очистке корзины:", error)
    return NextResponse.json(
      { message: "Ошибка при очистке корзины" },
      { status: 500 }
    )
  }
} 