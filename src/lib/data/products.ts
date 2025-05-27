"use server"

import { sdk } from "@lib/config"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = (_pageParam === 1) ? 0 : (_pageParam - 1) * limit;

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "id,title,subtitle,description,handle,status,thumbnail,weight,length,height,width,hs_code,mid_code,material,collection_id,type_id,discountable,external_id,created_at,updated_at,deleted_at,metadata,*variants.calculated_price,*variants.inventory_quantity,*variants.prices,*variants.options,*variants.metadata,*images.id,*images.url,*images.metadata,*options,*tags,*type,*collection,*categories.id,*categories.name,*categories.handle",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      console.log('🛍️ Загружено товаров:', products.length)
      if (products.length > 0) {
        console.log('📸 Изображения первого товара:', {
          id: products[0].id,
          title: products[0].title,
          images_count: products[0].images?.length || 0,
          images: products[0].images?.map(img => ({ id: img.id, url: img.url })) || []
        })
      }
      
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const nextPage = count > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

// Тип для отзыва (создаем собственный интерфейс)
export interface StoreProductReview {
  id: string
  product_id: string
  customer_id?: string
  rating: number
  title?: string
  content: string
  status?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, any>
}

// Функция для получения отзывов
export async function getProductReviews({
  productId,
  limit = 5,
  offset = 0,
}: {
  productId: string
  limit?: number
  offset?: number
}): Promise<{ 
  reviews: StoreProductReview[]; 
  count: number; 
  limit: number; 
  average_rating: number 
}> {
  // Эндпоинт может отличаться в зависимости от плагина!
  // Проверьте документацию плагина `@appateam/medusa-plugin-product-reviews`
  const endpoint = `/store/products/${productId}/reviews`

  const headers = {
    ...(await getAuthHeaders()), // Передаем заголовки авторизации, если нужны
  }

  const next = {
    ...(await getCacheOptions("reviews")), // Настраиваем кэширование
    tags: [`reviews_${productId}`], // Тег для ревалидации
  }

  // Используем try-catch для обработки ошибок
  try {
    // Делаем запрос к API
    const { reviews, count, average_rating } = await sdk.client.fetch<{
      reviews: StoreProductReview[];
      count: number;
      average_rating: number;
      // Добавьте другие поля, если API их возвращает (например, limit)
    }>(endpoint, {
      method: "GET",
      query: {
        limit,
        offset,
        // Добавьте другие параметры, если API их поддерживает (например, status='approved')
      },
      headers,
      next,
      cache: "force-cache", // Или 'no-store', если отзывы должны быть всегда свежими
    })
    
    return {
      reviews: reviews || [],
      count: count || 0,
      limit: limit, // Возвращаем limit, который передали
      average_rating: average_rating || 0,
    }
  } catch (error) {
    console.error(`Ошибка при получении отзывов для продукта ${productId}:`, error)
    // Возвращаем пустой результат в случае ошибки
    return {
      reviews: [],
      count: 0,
      limit: limit,
      average_rating: 0,
    }
  }
}

// Функция для добавления отзыва
interface AddReviewPayload {
  product_id: string
  customer_id?: string // ID пользователя, если он авторизован
  rating: number
  title?: string
  content: string
  // Плагин может требовать имя/фамилию, но безопаснее получать их на бэкенде
  // first_name?: string;
  // last_name?: string;
}

export async function addProductReview(
  payload: AddReviewPayload
): Promise<StoreProductReview> { // Возвращаем созданный отзыв
  // Эндпоинт может отличаться
  const endpoint = `/store/products/${payload.product_id}/reviews`

  const headers = {
    ...(await getAuthHeaders()), // Нужны заголовки авторизации!
  }

  const { review } = await sdk.client.fetch<{ review: StoreProductReview }>(endpoint, {
    method: "POST",
    body: payload, // Отправляем данные формы
    headers,
    cache: "no-store", // Не кэшируем POST запросы
  });

  // Можно добавить ревалидацию кеша отзывов после добавления нового
  // revalidateTag(`reviews_${payload.product_id}`)

  return review
}
