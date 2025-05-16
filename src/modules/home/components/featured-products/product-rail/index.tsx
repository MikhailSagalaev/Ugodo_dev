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
  // const queryParamsForApi: HttpTypes.StoreProductParams = {
  //   collection_id: [collection.id],
  //   fields: "*variants.calculated_price",
  //   limit: 12, // Увеличиваем лимит товаров
  // };

  const {
    response: { products: pricedProducts },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: [collection.id],
      fields: "*variants.calculated_price",
      limit: 12, // Увеличиваем лимит товаров
    } as HttpTypes.StoreProductParams,
  })

  if (!pricedProducts) {
    return null
  }

  return (
    <div className="content-container py-12 small:py-24 overflow-hidden"> {/* Добавил overflow-hidden */}
      <div className="flex justify-between mb-8">
        <Text className="txt-xlarge">{collection.title}</Text>
        <InteractiveLink href={`/collections/${collection.handle}`}>
          Посмотреть все
        </InteractiveLink>
      </div>
      <div className="relative"> {/* Добавил контейнер для слайдера */}
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-x-6 gap-y-24 small:gap-y-36 transition-all duration-500 ease-in-out"> {/* Изменил на 8 колонок и добавил transition */}
          {pricedProducts &&
            pricedProducts.map((product, index) => (
              <li key={product.id} className="transform transition-transform duration-300 hover:scale-105 hover:z-10"> {/* Добавил анимацию при наведении */}
                <ProductPreview 
                  product={product} 
                  region={region} 
                  isFeatured 
                  isFirstInMobileRow={index === 0}
                />
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}
