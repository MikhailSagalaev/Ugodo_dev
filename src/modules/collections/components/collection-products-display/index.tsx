/**
 * @file: src/modules/collections/components/collection-products-display/index.tsx
 * @description: Компонент для отображения списка продуктов в коллекции с пагинацией и обработкой фильтров.
 * @dependencies: react, @medusajs/types, @lib/data/products, @lib/data/regions, @modules/products/components/product-preview, @modules/store/components/pagination, @medusajs/ui
 * @created: 2024-07-27 (Примерная дата, заменить на актуальную при необходимости)
 */

import { cache } from "react"
import { HttpTypes } from "@medusajs/types"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductPreview from "@modules/products/components/product-preview"
import { Pagination } from "@modules/store/components/pagination"
import { Heading } from "@medusajs/ui"

const PRODUCT_LIMIT = 12

interface CollectionProductsDisplayProps {
  collectionId: string
  searchParams: {
    sortBy?: string
    page?: string
    category?: string
    type?: string
    tag?: string | string[]
    min_price?: string
    max_price?: string
    in_stock?: string
  }
  countryCode: string
  currentPage: number
}

type CustomCollectionProductParams = {
  limit: number
  offset: number
  region_id: string
  collection_id: string[]
  category_id?: string[]
  type_id?: string[]
  tag_id?: string[]
}

const fetchCollectionProductData = cache(
  async (
    collectionId: string,
    countryCode: string,
    searchParams: CollectionProductsDisplayProps["searchParams"],
    currentPage: number
  ) => {
    const region = await getRegion(countryCode)
    if (!region) {
      return { products: [], count: 0, totalPages: 0, region: null }
    }

    const sortBy = searchParams.sortBy || "created_at"

    const queryParams: CustomCollectionProductParams = {
      limit: PRODUCT_LIMIT,
      offset: (currentPage - 1) * PRODUCT_LIMIT,
      region_id: region.id,
      collection_id: [collectionId],
    }

    if (searchParams.category) {
      queryParams.category_id = Array.isArray(searchParams.category) ? searchParams.category : [searchParams.category];
    }
    if (searchParams.type) {
      queryParams.type_id = Array.isArray(searchParams.type) ? searchParams.type : [searchParams.type];
    }
    if (searchParams.tag) {
      queryParams.tag_id = Array.isArray(searchParams.tag) ? searchParams.tag : [searchParams.tag];
    }

    try {
      const { response } = await listProductsWithSort({
        page: currentPage,
        queryParams: queryParams as HttpTypes.StoreProductParams, 
        sortBy: sortBy as any,
        countryCode: countryCode,
      })

      if (!response) {
        throw new Error("No response from listProductsWithSort for collection")
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
      console.error(`Ошибка при получении списка товаров для коллекции ${collectionId}:`, error)
      return { products: [], count: 0, totalPages: 0, region }
    }
  }
)

export default async function CollectionProductsDisplay({
  collectionId,
  searchParams,
  countryCode,
  currentPage,
}: CollectionProductsDisplayProps) {
  const { products, count, totalPages, region } = await fetchCollectionProductData(
    collectionId,
    countryCode,
    searchParams,
    currentPage
  )

  if (!region) {
    return <div className="text-center py-8">Регион не найден.</div>
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Heading level="h2" className="text-xl font-medium mb-2">
          Товары не найдены
        </Heading>
        <p className="text-ui-fg-subtle">
          В данной коллекции пока нет товаров или они не соответствуют выбранным фильтрам.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-8 flex justify-between items-center">
        <Heading className="text-xl-semi">
          Показано: {products.length} из {count} товаров
        </Heading>
      </div>
      <ul
        className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-3 w-full justify-center px-0 lg:px-0"
        style={{ gap: 'clamp(35px, 5vw, 90px)' }}
        data-testid="collection-products-list"
      >
        {products.map((p, idx) => (
          <li key={p.id} className="flex justify-center">
            <div 
              className="w-full aspect-[3/4] product-card-container"
            >
              <ProductPreview 
                product={p} 
                region={region} 
                isFeatured={idx < 2}
                textAlign="left"
              />
            </div>
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <Pagination
          data-testid="collection-pagination"
          page={currentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  )
} 