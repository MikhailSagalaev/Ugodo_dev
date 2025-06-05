import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    
    // Устанавливаем httpOnly cookie для server-side использования
    cookieStore.set("_medusa_jwt", token, {
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });

    // Генерируем cache_id
    const cacheId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    cookieStore.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      httpOnly: true,
      sameSite: "strict", 
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });

    console.log("[Auth Token API] Server cookies set successfully");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Auth Token API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 