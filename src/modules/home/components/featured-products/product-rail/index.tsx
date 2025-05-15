import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { Region } from "@medusajs/medusa"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

// Типы пропсов теперь включают регион
type ProductRailProps = {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion // Добавляем регион
}

export default async function ProductRail({
  collection,
  region,
}: ProductRailProps) {
  const queryParamsForApi: HttpTypes.StoreProductParams = {
    collection_id: [collection.id],
    fields: "*variants.calculated_price",
  };

  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: [collection.id],
      fields: "*variants.calculated_price",
    } as HttpTypes.StoreProductParams,
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-24">
      <div className="flex justify-between mb-8">
        <Text className="txt-xlarge">{collection.title}</Text>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-x-6 gap-y-24 small:gap-y-36">
        {pricedProducts &&
          pricedProducts.map((product) => (
            <li key={product.id}>
              <ProductPreview product={product} region={region} isFeatured />
            </li>
          ))}
      </ul>
    </div>
  )
}
