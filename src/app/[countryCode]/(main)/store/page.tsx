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
  title: "Каталог товаров",
  description: "Ознакомьтесь с нашим широким ассортиментом товаров.",
}

const PRODUCT_LIMIT = 18

// Определяем кастомный тип для параметров запроса продуктов
interface CustomStoreProductListParams extends HttpTypes.FindParams, Omit<HttpTypes.StoreProductParams, 'tags'> {
  // HttpTypes.StoreProductParams может не содержать всех нужных полей или иметь не тот формат для tags
  // Поэтому мы расширяем его или переопределяем проблемные поля.
  // Стандартные поля из HttpTypes.StoreProductParams, которые точно есть и используются:
  // id?: string | string[];
  // sales_channel_id?: string;
  // collection_id?: string | string[];
  // title?: string;
  // description?: string;
  // handle?: string;
  // is_giftcard?: string;
  
  // Поля, которые мы добавляем/уточняем:
  q?: string;
  region_id?: string;
  category_id?: string | string[];
  type_id?: string | string[];
  tags?: string[] | { value: string[] }; // Позволяем использовать массив ID или объект { value: string[] }
  // min_price?: number; // Если когда-нибудь будем передавать
  // max_price?: number;
}

type StorePageProps = {
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

const fetchProductListData = cache(
  async (countryCode: string, searchParams: StorePageProps["searchParams"]) => {
    const region = await getRegion(countryCode)
    if (!region) {
      return { products: [], count: 0, totalPages: 0, region: null }
    }

    const page = searchParams.page ? parseInt(searchParams.page) : 1
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
      queryParams.tags = [searchParams.tag]
    }

    try {
      const { response } = await listProductsWithSort({
        page: page,
        queryParams: queryParams as HttpTypes.StoreProductParams,
        sortBy: sortBy,
        countryCode: countryCode,
      })

      if (!response) {
        throw new Error("No response from listProductsWithSort")
      }
      const { products, count } = response;

      let filteredProducts: HttpTypes.StoreProduct[] = products
      let actualCount = count

      if (searchParams.in_stock) {
        const inStock = searchParams.in_stock === "true"
        filteredProducts = products.filter((product: HttpTypes.StoreProduct) => {
          const hasInStockVariant = product.variants?.some((variant: HttpTypes.StoreProductVariant) => {
            if (!variant.manage_inventory) return true
            if (variant.allow_backorder) return true
            return (variant.inventory_quantity || 0) > 0
          })
          return inStock ? hasInStockVariant : !hasInStockVariant
        })
        actualCount = filteredProducts.length
      }
      
      const totalPages = Math.ceil(actualCount / PRODUCT_LIMIT)
      return { products: filteredProducts, count: actualCount, totalPages, region }
    } catch (error) {
      console.error("Ошибка при получении списка товаров:", error)
      return { products: [], count: 0, totalPages: 0, region }
    }
  }
)

const fetchFilterData = cache(async (countryCode: string) => {
  // Запрашиваем категории с их потомками
  const categoriesData = await listCategories({ 
    fields: "id,name,handle,parent_category_id,*category_children", 
    include_descendants_tree: true // Этот параметр может быть не нужен если fields уже включает *category_children
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
    console.error("Ошибка при получении диапазона цен для фильтров:", error)
  }

  // Маппинг больше не нужен, если listCategories возвращает HttpTypes.StoreProductCategory[]
  // и ProductFiltersProps.categories ожидает этот тип.
  return {
    categories: categoriesData, // Передаем данные как есть
    types: typesData,
    tags: tagsData,
    priceRange: { min: minPrice, max: maxPrice },
  }
})

export default async function StorePage({ params, searchParams }: StorePageProps) {
  const { countryCode } = params

  const productDataPromise = fetchProductListData(countryCode, searchParams)
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
