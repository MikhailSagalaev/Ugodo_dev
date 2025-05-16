import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import PaginatedProducts from "@modules/store/components/product-list"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { type SortOptions } from "@lib/data/products"

export default function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (currentCategory: HttpTypes.StoreProductCategory) => {
    if (currentCategory.parent_category) {
      parents.unshift(currentCategory.parent_category)
      getParents(currentCategory.parent_category)
    }
  }

  getParents(category)

  return (
    <div className="py-6 content-container" data-testid="category-container">
      <div className="w-full">
        <div className="flex flex-wrap items-center mb-8 text-2xl-semi gap-x-2 gap-y-1">
          {parents && parents.length > 0 && (
            parents.map((parent) => (
              <span key={parent.id} className="text-ui-fg-subtle flex items-center">
                <LocalizedClientLink
                  className="hover:text-ui-fg-base"
                  href={`/categories/${parent.handle}`}
                  data-testid={`parent-category-link-${parent.handle}`}
                >
                  {parent.name}
                </LocalizedClientLink>
                <span className="mx-2">/</span>
              </span>
            ))
          )}
          <h1 data-testid="category-page-title" className="text-xl-semi md:text-2xl-semi">{category.name}</h1>
        </div>
        {category.description && (
          <div className="mb-8 text-base-regular">
            <p>{category.description}</p>
          </div>
        )}
        {category.category_children && category.category_children.length > 0 && (
          <div className="mb-8 text-base-large">
            <h3 className="text-lg-semi mb-3">Подкатегории:</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
              {category.category_children?.map((c) => (
                <li key={c.id}>
                  <InteractiveLink href={`/categories/${c.handle}`}>
                    {c.name}
                  </InteractiveLink>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Suspense
          fallback={<SkeletonProductGrid />}
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            categoryId={category.id}
            countryCode={countryCode}
          />
        </Suspense>
      </div>
    </div>
  )
}
