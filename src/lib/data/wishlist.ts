"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { revalidateTag } from "next/cache"
import { HttpTypes } from "@medusajs/types"

// Тип для элемента списка избранного (уточнить по факту ответа API)
interface WishlistItem extends HttpTypes.StoreLineItem {
  // Могут быть дополнительные поля, если плагин их добавляет
}

// Тип для объекта Wishlist (основан на StoreCart)
interface Wishlist extends HttpTypes.StoreCart {
  items: WishlistItem[];
}

// Тег для кэша Next.js
const WISHLIST_CACHE_TAG = "wishlist"

/**
 * Получает список избранного для текущего пользователя.
 */
export async function getWishlist(): Promise<Wishlist | null> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    console.log("[getWishlist] No auth headers, user likely not logged in.");
    return null
  }

  try {
    // Используем graph для большей гибкости и получения связанных данных, если нужно
    const { data } = await sdk.client.fetch<{ data: { wishlist?: Wishlist } }>(
       // TODO: Уточнить точный эндпоинт и структуру ответа бэкенд-плагина
      `/store/customers/me/wishlists?fields=id,items.id,items.variant_id`, // Примерный запрос
      {
        method: "GET",
        headers,
        next: { 
          tags: [WISHLIST_CACHE_TAG],
          ...(await getCacheOptions(WISHLIST_CACHE_TAG))
        },
      }
    )
    // Возвращаем первый элемент, если он есть
    // Адаптировать в зависимости от реального ответа API
    return data?.wishlist || null;
  } catch (error: any) {
    if (error.response?.status === 404 || error.message?.includes('404')) {
      console.log("Wishlist not found for customer (404), returning null.");
      return null;
    }
    console.error("Ошибка при получении списка избранного:", error?.message || error)
    return null 
  }
}

/**
 * Добавляет вариант товара в список избранного.
 */
export async function addToWishlist(variantId: string): Promise<Wishlist | null> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    console.error("Неавторизованный пользователь не может добавить в избранное.")
    throw new Error("Пользователь не авторизован."); // Лучше выбросить ошибку
  }

  try {
     // TODO: Уточнить точный эндпоинт и структуру ответа бэкенд-плагина
    const { wishlist } = await sdk.client.fetch<{ wishlist: Wishlist }>(
      `/store/customers/me/wishlists/items`, // Эндпоинт из примера
      {
        method: "POST",
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          variant_id: variantId 
        }),
        cache: "no-store", 
      }
    )
    revalidateTag(WISHLIST_CACHE_TAG)
    console.log("[addToWishlist] API success, returning wishlist:", wishlist);
    return wishlist; // Возвращаем обновленный wishlist от API
  } catch (error: any) {
    console.error(`Ошибка при добавлении варианта ${variantId} в избранное:`, error?.message || error)
    throw error; // Пробрасываем ошибку для обработки в контексте
  }
}

/**
 * Удаляет элемент из списка избранного.
 * @param itemId ID элемента списка избранного (wishlist item ID)
 */
export async function removeFromWishlist(itemId: string): Promise<Wishlist | null> {
  const headers = await getAuthHeaders()
  if (!headers.Authorization) {
    console.error("Неавторизованный пользователь не может удалить из избранного.")
    throw new Error("Пользователь не авторизован.");
  }

  try {
     // TODO: Уточнить точный эндпоинт и структуру ответа бэкенд-плагина
    const { wishlist } = await sdk.client.fetch<{ wishlist: Wishlist }>(
      `/store/customers/me/wishlists/items/${itemId}`, // Эндпоинт из примера
      {
        method: "DELETE",
        headers,
        cache: "no-store",
      }
    )
    revalidateTag(WISHLIST_CACHE_TAG)
     console.log("[removeFromWishlist] API success, returning wishlist:", wishlist);
    return wishlist; // Возвращаем обновленный wishlist от API
  } catch (error: any) {
    console.error(`Ошибка при удалении элемента ${itemId} из избранного:`, error?.message || error)
    throw error; // Пробрасываем ошибку
  }
} 