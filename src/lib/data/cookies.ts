import "server-only"
import { cookies as nextCookies } from "next/headers"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch (error) {
    console.warn("Не удалось получить cookies в getAuthHeaders:", error);
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[] } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  if (!cacheTag) {
    return {}
  }

  return { tags: [`${cacheTag}`] }
}

export const setAuthToken = async (token: string) => {
  try {
    const cookies = await nextCookies()
    cookies.set("_medusa_jwt", token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
  } catch (error) {
    console.warn("Не удалось установить auth token:", error);
  }
}

export const removeAuthToken = async () => {
  try {
    const cookies = await nextCookies()
    cookies.set("_medusa_jwt", "", {
      maxAge: -1,
    })
  } catch (error) {
    console.warn("Не удалось удалить auth token:", error);
  }
}

export const getCartId = async () => {
  try {
    const cookies = await nextCookies()
    return cookies.get("_medusa_cart_id")?.value
  } catch (error) {
    console.warn("Не удалось получить cart ID:", error);
    return undefined
  }
}

export const setCartId = async (cartId: string) => {
  try {
    const cookies = await nextCookies()
    cookies.set("_medusa_cart_id", cartId, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
  } catch (error) {
    console.warn("Не удалось установить cart ID:", error);
  }
}

export const removeCartId = async () => {
  try {
    const cookies = await nextCookies()
    cookies.set("_medusa_cart_id", "", {
      maxAge: -1,
    })
  } catch (error) {
    console.warn("Не удалось удалить cart ID:", error);
  }
}
