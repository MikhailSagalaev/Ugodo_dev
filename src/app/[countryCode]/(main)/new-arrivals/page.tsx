/**
 * @file: src/app/[countryCode]/(main)/new-arrivals/page.tsx
 * @description: Страница для отображения новых поступлений товаров, с фильтрацией и пагинацией, аналогично /store, но с сортировкой по умолчанию по дате создания.
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
  title: "Новинки",
  description: "Самые свежие поступления товаров в нашем магазине.",
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
type NewArrivalsPageProps = {
  params: { countryCode: string }
  searchParams: {
    sortBy?: ProductSortOptions
    page?: string
    category?: string
    type?: string
    tag?: string
    min_price?: string
    max_price?: string
    in_stock?: string
    q?: string
  }
}

// Адаптированная функция fetchProductListData
const fetchNewArrivalsProductData = cache(
  async (countryCode: string, searchParams: NewArrivalsPageProps["searchParams"]) => {
    const region = await getRegion(countryCode)
    if (!region) {
      return { products: [], count: 0, totalPages: 0, region: null }
    }

    const page = searchParams.page ? parseInt(searchParams.page) : 1
    // Сортировка по умолчанию 'created_at' для новинок
    // Пользователь все еще может изменить сортировку через searchParams
    const sortBy = searchParams.sortBy || "created_at" 
    
    const queryParams: CustomStoreProductListParams = {
      limit: PRODUCT_LIMIT,
      offset: (page - 1) * PRODUCT_LIMIT,
      region_id: region.id,
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
    if (searchParams.tag) {
      queryParams.tags = {value: [searchParams.tag] } // Адаптировано под CustomStoreProductListParams
    }
    // Добавим фильтрацию по цене, если она есть в searchParams
    if (searchParams.min_price) {
      // API может ожидать числа, поэтому преобразуем, если это так.
      // queryParams.min_price = parseInt(searchParams.min_price);
    }
    if (searchParams.max_price) {
      // queryParams.max_price = parseInt(searchParams.max_price);
    }

    try {
      const { response } = await listProductsWithSort({
        page: page,
        queryParams: queryParams as HttpTypes.StoreProductParams, // Приведение типа, как в store/page.tsx
        sortBy: sortBy,
        countryCode: countryCode,
      })

      if (!response) {
        throw new Error("No response from listProductsWithSort for new arrivals")
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
      console.error("Ошибка при получении списка новых товаров:", error)
      return { products: [], count: 0, totalPages: 0, region }
    }
  }
)

// fetchFilterData можно переиспользовать из store/page.tsx, если он экспортирован
// Если нет, его нужно скопировать или импортировать.
// Для простоты, предположим, что он доступен (или мы его скопируем ниже, если нужно).
// Скопируем fetchFilterData для ясности, т.к. он не был экспортирован из store/page.tsx
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
    console.error("Ошибка при получении диапазона цен для фильтров (новинки):", error)
  }

  return {
    categories: categoriesData,
    types: typesData,
    tags: tagsData,
    priceRange: { min: minPrice, max: maxPrice },
  }
})

export default async function NewArrivalsPage({ params, searchParams }: NewArrivalsPageProps) {
  const { countryCode } = params

  // Используем адаптированную функцию для получения данных
  const productDataPromise = fetchNewArrivalsProductData(countryCode, searchParams)
  const filterUIDataPromise = fetchFilterData(countryCode) // Та же функция для фильтров

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
              searchParams={searchParams} // Передаем searchParams для StoreProductsDisplay
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 