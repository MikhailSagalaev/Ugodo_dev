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
  .then(response => response.json())
  .then(({ product_categories }) => product_categories || [])
  .catch((error) => {
    console.error('Ошибка загрузки категорий:', error)
    return []
  })
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const headers = {
    ...(await getAuthHeaders()),
  }

  return fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.ugodo.ru'}/store/product-categories?handle=${handle}&fields=id,name,handle,description,parent_category_id,category_children.id,category_children.name,category_children.handle,category_children.description`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || 'pk_0048139e2ebcc99d8b8c5232f681feec04f0a547bf24953ab8f212925750b8d8',
      ...headers,
    },
    cache: "force-cache",
  })
  .then(response => response.json())
  .then(({ product_categories }) => product_categories?.[0] || null)
  .catch((error) => {
    console.error('Ошибка поиска категории по handle:', error)
    return null
  })
}
