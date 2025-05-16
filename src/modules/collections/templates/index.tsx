import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
// import RefinementList from "@modules/store/components/refinement-list" // УДАЛЕНО
// import { SortOptions } from "@modules/store/components/refinement-list/sort-products" // УДАЛЕНО, если тип SortOptions теперь глобальный
import PaginatedProducts from "@modules/store/components/product-list" // НОВЫЙ ПУТЬ
import { HttpTypes } from "@medusajs/types"
import { type SortOptions } from "@lib/data/products" // ИМПОРТ ГЛОБАЛЬНОГО ТИПА
import ProductPreview from "@modules/products/components/product-preview"

export default function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
}: {
  sortBy?: SortOptions // Используем глобальный тип
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    // <div className="flex flex-col small:flex-row small:items-start py-6 content-container">
    //   {/* RefinementList УДАЛЕН */}
    //   <div className="w-full">
    //     ...
    //   </div>
    // </div>
    // Упрощенная структура без боковой панели фильтров, так как RefinementList удален
    // Если фильтры нужны, нужно будет интегрировать ProductFilters или аналогичный компонент
    <div className="py-6 content-container">
      <div className="mb-8 text-2xl-semi">
        <h1>{collection.title}</h1>
      </div>
      {/* Можно добавить селектор сортировки здесь, если ProductFilters не используется */}
      <Suspense
        fallback={
          <SkeletonProductGrid
            // numberOfProducts={collection.products?.length} // collection.products может быть неактуальным без прямой загрузки
          />
        }
      >
        <PaginatedProducts
          sortBy={sort}
          page={pageNumber}
          // PaginatedProducts нужно будет адаптировать для приема collectionId
          // или создать новую функцию для загрузки продуктов коллекции с пагинацией и сортировкой
          // Пока передаю, но PaginatedProducts его не использует
          // collectionId={collection.id} 
          countryCode={countryCode}
        />
      </Suspense>
    </div>
  )
}
