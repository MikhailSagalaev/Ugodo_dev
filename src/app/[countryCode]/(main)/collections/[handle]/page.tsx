/**
 * @file: src/app/[countryCode]/(main)/collections/[handle]/page.tsx
 * @description: Страница для отображения конкретной коллекции (бренда) по ее handle. Загружает данные коллекции, данные для фильтров и отображает их с помощью CollectionTemplate.
 * @dependencies: next, react, @lib/data/collections, @lib/data/regions, @medusajs/types, @modules/collections/templates, @lib/data/products, @lib/data/categories, @lib/data/product-filters
 * @created: 2024-07-27 (Примерная дата, заменить на актуальную при необходимости)
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense, cache } from "react"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions as ProductSortOptions } from "@lib/data/products"

import { listCategories } from "@lib/data/categories"
import { listProductTypes, listProductTags, getProductPriceRanges } from "@lib/data/product-filters"

interface CollectionPageSearchParams {
  sortBy?: ProductSortOptions
  page?: string
  category?: string
  type?: string
  tag?: string
  min_price?: string
  max_price?: string
  in_stock?: string
}

type Props = {
  params: { handle: string; countryCode: string }
  searchParams: CollectionPageSearchParams
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await listCollections({
    fields: "id,handle",
  })

  if (!collections || collections.length === 0) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: HttpTypes.StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: HttpTypes.StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()
    .filter(p => p.handle);

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const collection = await getCollectionByHandle(props.params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Ugodo Store`,
    description: `${collection.title} collection`,
    openGraph: {
      title: `${collection.title} | Ugodo Store`,
      description: `${collection.title} collection`,
      images: collection.metadata?.og_image ? [collection.metadata.og_image as string] : [],
    },
  } as Metadata

  return metadata
}

const fetchFilterData = cache(async (countryCode: string) => {
  const categoriesData = await listCategories({
    fields: "id,name,handle,parent_category_id,*category_children",
    include_descendants_tree: true,
  }).catch(() => [])

  const typesData = await listProductTypes().catch(() => [])
  const tagsData = await listProductTags().catch(() => [])

  let minPrice = 0
  let maxPrice = 100000

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
    console.error("Ошибка при получении диапазона цен для фильтров коллекции:", error)
  }

  return {
    categories: categoriesData,
    types: typesData,
    tags: tagsData,
    priceRange: { min: minPrice, max: maxPrice },
  }
})

export default async function CollectionPage(props: Props) {
  const { countryCode, handle } = props.params
  const searchParams = props.searchParams

  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    notFound()
  }

  const filterUIData = await fetchFilterData(countryCode)

  return (
    <CollectionTemplate
      collection={collection}
      searchParams={searchParams}
      countryCode={countryCode}
      filterData={filterUIData}
    />
  )
}
