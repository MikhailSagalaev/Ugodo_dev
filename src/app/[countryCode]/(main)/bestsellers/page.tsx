/**
 * @file: src/app/[countryCode]/(main)/bestsellers/page.tsx
 * @description: Страница для отображения хитов продаж (бестселлеров), с фильтрацией и пагинацией. Текущая реализация идентична /store и требует доработки логики определения бестселлеров.
 * @dependencies: next, react, @lib/data/*, @modules/store/components/*, @modules/skeletons/templates/*, @medusajs/types
 * @created: 2024-07-26 (Примерная дата, заменить на актуальную при необходимости)
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { cache } from "react"

import { listCategories } from "@lib/data/categories"
import { listProductTypes, listProductTags, getProductPriceRanges } from "@lib/data/product-filters"
import { listProductsWithSort, type SortOptions as ProductSortOptions } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"

import ProductFilters from "@modules/store/components/product-filters"
import StoreProductsDisplay from "@modules/store/components/store-products-display"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export const metadata: Metadata = {
  title: "Хиты продаж",
  description: "Самые популярные товары в нашем магазине.",
}

const PRODUCT_LIMIT = 18

// Используем тот же CustomStoreProductListParams, что и в store/page.tsx
interface CustomStoreProductListParams extends HttpTypes.FindParams, Omit<HttpTypes.StoreProductParams, 'tags'> {
  q?: string;
  region_id?: string;
  category_id?: string | string[];
  type_id?: string | string[];
  tags?: string[] | { value: string[] }; 
}

// Тип для searchParams такой же, как в StorePageProps
type BestsellersPageProps = {
  params: { countryCode: string }
  searchParams: {
    sortBy?: ProductSortOptions
    page?: string
    category?: string
    type?: string
    tag?: string // Если бестселлеры будут определяться тегом, это пригодится
    min_price?: string
    max_price?: string
    in_stock?: string
    q?: string
  }
}

// Адаптированная функция fetchProductListData
// На данный момент она идентична fetchProductListData из store/page.tsx
// В будущем здесь можно будет добавить логику для получения бестселлеров
// (например, фильтрация по специальному тегу или сортировка по другому параметру)
const fetchBestsellersProductData = cache(
  async (countryCode: string, searchParams: BestsellersPageProps["searchParams"]) => {
    const region = await getRegion(countryCode)
    if (!region) {
      return { products: [], count: 0, totalPages: 0, region: null }
    }

    const page = searchParams.page ? parseInt(searchParams.page) : 1
    // Для бестселлеров оставим сортировку по умолчанию 'created_at', 
    // так как основная логика будет в фильтрации по тегу.
    // Пользователь все еще может изменить сортировку через UI.
    const sortBy = searchParams.sortBy || "created_at" 
    
    const queryParams: CustomStoreProductListParams = {
      limit: PRODUCT_LIMIT,
      offset: (page - 1) * PRODUCT_LIMIT,
      region_id: region.id,
      // По умолчанию фильтруем по тегу 'bestseller'
      // Если пользователь выберет другой тег в фильтрах, он перезапишет этот.
      // Если пользователь снимет все теги в фильтрах, то этот тег тоже снимется, 
      // так как searchParams.tag будет undefined или пустой строкой.
      // Чтобы всегда фильтровать по 'bestseller' независимо от UI, логику нужно усложнять.
      // Пока что делаем так, чтобы UI-фильтр по тегам имел приоритет.
      tags: { value: [searchParams.tag || 'bestseller'] },
    }
    
    // Удаляем tags из queryParams, если searchParams.tag пустой (например, пользователь очистил фильтр тегов)
    // или если searchParams.tag явно 'all' (если бы мы такой фильтр добавили)
    // Это позволяет отобразить все товары, если фильтр по тегам неактивен, 
    // но при этом если фильтра нет, то по умолчанию будет 'bestseller'
    if (searchParams.tag === '') {
        delete queryParams.tags;
    } else if (searchParams.tag) {
        queryParams.tags = { value: [searchParams.tag] };
    } else {
        // Если searchParams.tag не предоставлен (undefined), то используем 'bestseller'
        queryParams.tags = { value: ['bestseller'] };
    }

    if (searchParams.q) {
      queryParams.q = searchParams.q;
    }
    if (searchParams.category) {
      queryParams.category_id = [searchParams.category]
    }
    if (searchParams.type) {
      queryParams.type_id = [searchParams.type]
    }
    // Фильтрация по тегу уже обработана выше

    try {
      const { response } = await listProductsWithSort({
        page: page,
        queryParams: queryParams as HttpTypes.StoreProductParams,
        sortBy: sortBy,
        countryCode: countryCode,
      })

      if (!response) {
        throw new Error("No response from listProductsWithSort for bestsellers")
      }
      let { products, count } = response

      if (searchParams.in_stock) {
        const inStock = searchParams.in_stock === "true"
        products = products.filter((product: HttpTypes.StoreProduct) => {
          const hasInStockVariant = product.variants?.some((variant: HttpTypes.StoreProductVariant) => {
            if (!variant.manage_inventory) return true
            if (variant.allow_backorder) return true
            return (variant.inventory_quantity || 0) > 0
          })
          return inStock ? hasInStockVariant : !hasInStockVariant
        })
        count = products.length
      }
      
      const totalPages = Math.ceil(count / PRODUCT_LIMIT)
      return { products, count, totalPages, region }
    } catch (error) {
      console.error("Ошибка при получении списка хитов продаж:", error)
      return { products: [], count: 0, totalPages: 0, region }
    }
  }
)

// fetchFilterData можно переиспользовать
const fetchFilterData = cache(async (countryCode: string) => {
  const categoriesData = await listCategories({
    fields: "id,name,handle,parent_category_id,*category_children",
    include_descendants_tree: true
  }).catch(() => [])
  
  const typesData = await listProductTypes().catch(() => [])
  const tagsData = await listProductTags().catch(() => [])
  
  let minPrice = 0;
  let maxPrice = 100000;
  
  try {
    const priceRanges = await getProductPriceRanges(countryCode)
    if (priceRanges && priceRanges.length > 0) {
      const validMinPrices = priceRanges.map(p => p.min).filter(p => p !== null && typeof p === 'number') as number[];
      const validMaxPrices = priceRanges.map(p => p.max).filter(p => p !== null && typeof p === 'number') as number[];

      if (validMinPrices.length > 0) {
        minPrice = Math.floor(Math.min(...validMinPrices));
      }
      if (validMaxPrices.length > 0) {
        maxPrice = Math.ceil(Math.max(...validMaxPrices));
      }
      if (validMinPrices.length === 0 && validMaxPrices.length === 0) { 
        minPrice = 0;
        maxPrice = 100000;
      } else if (validMinPrices.length === 0) { 
        minPrice = 0; 
      } else if (validMaxPrices.length === 0) { 
        maxPrice = minPrice > 100000 ? minPrice + 10000 : 100000; 
      }
      if (maxPrice < minPrice) maxPrice = minPrice;
    }
  } catch (error) {
    console.error("Ошибка при получении диапазона цен для фильтров (хиты продаж):", error)
  }

  return {
    categories: categoriesData,
    types: typesData,
    tags: tagsData,
    priceRange: { min: minPrice, max: maxPrice },
  }
})

export default async function BestsellersPage({ params, searchParams }: BestsellersPageProps) {
  const { countryCode } = params

  const productDataPromise = fetchBestsellersProductData(countryCode, searchParams)
  const filterUIDataPromise = fetchFilterData(countryCode)

  const [productData, filterUIData] = await Promise.all([
    productDataPromise,
    filterUIDataPromise,
  ])

  if (!productData.region) {
    return notFound()
  }
  
  return (
    <div className="content-container py-6">
      <div className="flex flex-col md:flex-row gap-x-8 gap-y-6">
        <Suspense fallback={<div className="w-full md:w-1/4 lg:w-1/5">Загрузка фильтров...</div>}>
          <ProductFilters
            categories={filterUIData.categories}
            types={filterUIData.types}
            tags={filterUIData.tags}
            priceRange={filterUIData.priceRange}
            searchParams={searchParams} 
          />
        </Suspense>
        
        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <StoreProductsDisplay
              products={productData.products}
              totalPages={productData.totalPages}
              currentPage={searchParams.page ? parseInt(searchParams.page) : 1}
              count={productData.count}
              region={productData.region}
              countryCode={countryCode}
              searchParams={searchParams}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 