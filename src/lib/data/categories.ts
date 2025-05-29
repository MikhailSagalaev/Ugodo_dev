import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions, getAuthHeaders } from "./cookies"

export const listCategories = async (query?: Record<string, any>) => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const limit = query?.limit || 100

  console.log('🔍 Загружаем ВСЕ категории через прямой fetch...')

  return fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.ugodo.ru'}/store/product-categories?include_descendants_tree=true&fields=id,name,handle,description,parent_category_id,category_children.id,category_children.name,category_children.handle,category_children.description&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_0048139e2ebcc99d8b8c5232f681feec04f0a547bf24953ab8f212925750b8d8',
      ...headers,
    },
    next,
    cache: "force-cache",
  })
  .then(response => {
    console.log('📡 Ответ API категорий:', response.status, response.statusText)
    return response.json()
  })
  .then(({ product_categories }) => {
    console.log('📦 Получено ВСЕХ категорий через fetch:', product_categories?.length || 0)
    console.log('📋 Структура категорий:', product_categories?.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      handle: cat.handle,
      parent_category_id: cat.parent_category_id,
      children_count: cat.category_children?.length || 0,
      children: cat.category_children?.map((child: any) => ({ id: child.id, name: child.name })) || []
    })))
    return product_categories || []
  })
  .catch((error) => {
    console.error('❌ Ошибка загрузки категорий через fetch:', error)
    return []
  })
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const headers = {
    ...(await getAuthHeaders()),
  }

  console.log('🔍 Ищем категорию по handle через fetch:', handle)

  return fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.ugodo.ru'}/store/product-categories?handle=${handle}&fields=id,name,handle,description,category_children.id,category_children.name,category_children.handle,category_children.description`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_0048139e2ebcc99d8b8c5232f681feec04f0a547bf24953ab8f212925750b8d8',
      ...headers,
    },
    cache: "force-cache",
  })
  .then(response => {
    console.log('📡 Ответ поиска категории:', response.status, response.statusText)
    return response.json()
  })
  .then(({ product_categories }) => {
    console.log('📦 Найдено категорий по handle через fetch:', product_categories?.length || 0)
    if (product_categories && product_categories.length > 0) {
      console.log('📋 Найденная категория:', {
        id: product_categories[0].id,
        name: product_categories[0].name,
        handle: product_categories[0].handle,
        children_count: product_categories[0].category_children?.length || 0
      })
    }
    return product_categories?.[0] || null
  })
  .catch((error) => {
    console.error('❌ Ошибка поиска категории по handle через fetch:', error)
    return null
  })
}
