/**
 * @file: src/modules/collections/templates/index.tsx
 * @description: Шаблон для отображения страницы коллекции (бренда), включая заголовок, описание, фильтры и список продуктов.
 * @dependencies: react, @modules/skeletons/templates/skeleton-product-grid, @modules/store/components/product-filters, @modules/collections/components/collection-products-display, @medusajs/types, @lib/data/products, @medusajs/ui
 * @created: 2024-07-27 (Примерная дата, заменить на актуальную при необходимости)
 */

import { Suspense } from "react"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import ProductFilters from "@modules/store/components/product-filters"
import CollectionProductsDisplay from "@modules/collections/components/collection-products-display"
import { HttpTypes } from "@medusajs/types"
import { type SortOptions as ProductSortOptions } from "@lib/data/products"
import { Heading } from "@medusajs/ui"

export type FilterData = {
  categories: HttpTypes.StoreProductCategory[] | []
  types: HttpTypes.StoreProductType[] | []
  tags: HttpTypes.StoreProductTag[] | []
  priceRange: { min: number; max: number }
}

interface CollectionTemplateProps {
  collection: HttpTypes.StoreCollection
  searchParams: {
    sortBy?: ProductSortOptions
    page?: string
    category?: string
    type?: string
    tag?: string
    min_price?: string
    max_price?: string
    in_stock?: string
  }
  countryCode: string
  filterData: FilterData
}

export default function CollectionTemplate({
  collection,
  searchParams,
  countryCode,
  filterData,
}: CollectionTemplateProps) {
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1
  const collectionDescription = collection.metadata?.description as string | undefined;

  return (
    <div className="content-container py-6">
      <Heading level="h1" className="text-3xl font-bold mb-2">
        {collection.title}
      </Heading>
      {collectionDescription && (
        <p className="text-base text-ui-fg-subtle mb-8">
          {collectionDescription}
        </p>
      )}
      <div className="flex flex-col md:flex-row gap-x-8 gap-y-6">
        <Suspense fallback={<div className="w-full md:w-1/4 lg:w-1/5">Загрузка фильтров...</div>}>
          <ProductFilters
            categories={filterData.categories}
            types={filterData.types}
            tags={filterData.tags}
            priceRange={filterData.priceRange}
            searchParams={searchParams}
          />
        </Suspense>

        <div className="w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <CollectionProductsDisplay
              collectionId={collection.id}
              searchParams={searchParams}
              countryCode={countryCode}
              currentPage={currentPage}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
