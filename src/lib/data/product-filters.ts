"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

// Получение всех типов товаров
export const listProductTypes = async () => {
  const next = {
    ...(await getCacheOptions("product-types")),
  }

  return sdk.client
    .fetch<{ types: { id: string; value: string }[] }>("/store/product-types", {
      next,
      cache: "force-cache",
    })
    .then(({ types }) => types)
    .catch((error) => {
      console.error("Ошибка при получении типов товаров:", error)
      return []
    })
}

// Получение всех тегов товаров
export const listProductTags = async () => {
  const next = {
    ...(await getCacheOptions("product-tags")),
  }

  return sdk.client
    .fetch<{ tags: { id: string; value: string }[] }>("/store/product-tags", {
      next,
      cache: "force-cache",
    })
    .then(({ tags }) => tags)
    .catch((error) => {
      console.error("Ошибка при получении тегов товаров:", error)
      return []
    })
}

// Получение ценовых диапазонов на основе имеющихся товаров
export const getProductPriceRanges = async (countryCode: string) => {
  try {
    // Получаем все товары (с лимитом 100 для эффективности)
    const response = await sdk.client.fetch<{ products: HttpTypes.StoreProduct[] }>(
      "/store/products",
      {
        query: {
          limit: 100,
          fields: "variants.prices",
        },
        next: {
          ...(await getCacheOptions("products")),
        },
        cache: "force-cache",
      }
    )

    // Извлекаем все варианты и их цены
    const allPrices = response.products
      .flatMap(product => product.variants || [])
      .map(variant => {
        // Преобразуем calculated_price в number
        const price = typeof variant.calculated_price === 'number' 
          ? variant.calculated_price 
          : 0
        return price
      })
      .filter(price => price > 0)
      .sort((a, b) => a - b)

    if (allPrices.length === 0) {
      return []
    }

    // Находим минимальную и максимальную цену
    const minPrice = allPrices[0]
    const maxPrice = allPrices[allPrices.length - 1]

    // Создаем ценовые диапазоны
    // Пример: создаем 4 равных диапазона от минимальной до максимальной цены
    const range = Math.floor((maxPrice - minPrice) / 4)
    
    return [
      { min: minPrice, max: minPrice + range },
      { min: minPrice + range, max: minPrice + range * 2 },
      { min: minPrice + range * 2, max: minPrice + range * 3 },
      { min: minPrice + range * 3, max: maxPrice }
    ]
  } catch (error) {
    console.error("Ошибка при получении ценовых диапазонов:", error)
    return []
  }
}

// Функция для получения всех категорий в плоском виде
export const getAllCategories = async () => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          limit: 100,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories)
    .catch((error) => {
      console.error("Ошибка при получении категорий:", error)
      return []
    })
} 