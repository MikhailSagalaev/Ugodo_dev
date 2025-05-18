import { NextResponse } from 'next/server'
import { retrieveCart } from "@lib/data/cart"

export async function GET() {
  try {
    const cart = await retrieveCart().catch(() => null)
    return NextResponse.json({ cart })
  } catch (error) {
    console.error('Ошибка при получении корзины:', error)
    return NextResponse.json({ cart: null }, { status: 500 })
  }
} 