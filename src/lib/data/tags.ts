/**
 * @file: tags.ts
 * @description: Функции для работы с тегами продуктов MedusaJS.
 * @dependencies: @lib/config, @medusajs/types, ./cookies
 * @created: 2024-07-30
 */

import { sdk } from "@lib/config";
import { HttpTypes } from "@medusajs/types";
import { getCacheOptions } from "./cookies";

/**
 * Получает один тег продукта по его значению.
 * @param tagValue Значение тега для поиска.
 * @returns Promise<HttpTypes.StoreProductTag | undefined>
 */
export const getTagByValue = async (tagValue: string): Promise<HttpTypes.StoreProductTag | undefined> => {
  const next = {
    ...(await getCacheOptions("tags")) // Используем общий кеш для тегов или специфичный
  };

  try {
    const { product_tags } = await sdk.client.fetch<{
      product_tags: HttpTypes.StoreProductTag[];
    }>("/store/product-tags", {
      method: "GET",
      query: {
        value: tagValue,
        limit: 1 // Нам нужен только один тег
      },
      next,
      cache: "force-cache",
    });

    return product_tags && product_tags.length > 0 ? product_tags[0] : undefined;
  } catch (error) {
    console.error(`Ошибка при получении тега по значению "${tagValue}":`, error);
    return undefined;
  }
}; 