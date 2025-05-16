import { HttpTypes } from "@medusajs/types"
import { Region } from "@medusajs/medusa"
import ProductPreview from "@modules/products/components/product-preview"

// Типы пропсов теперь включают регион
type FeaturedProductsProps = {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion // Исправляем тип
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ collections, region }) => {
  return (
    <div className="py-12 overflow-hidden">
      <div className="content-container py-12">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-base-regular text-ui-fg-base mb-6">Новинки</span>
          <p className="text-2xl-regular text-ui-fg-subtle max-w-lg">
            Каждый сезон мы представляем новые товары. Следите за нашими новинками.
          </p>
        </div>
        <div className="relative">
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-x-4 gap-y-8 transition-transform duration-500 ease-in-out">
            {collections.map((collection) =>
              collection.products?.map((product, productIndex) => {
                const isOverallFirst = collections.indexOf(collection) === 0 && productIndex === 0;
                return (
                  <li key={product.id} className="transform transition-transform duration-300 hover:scale-105">
                    <ProductPreview 
                      product={product} 
                      region={region} 
                      isFeatured 
                      isFirstInMobileRow={isOverallFirst}
                    />
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FeaturedProducts
