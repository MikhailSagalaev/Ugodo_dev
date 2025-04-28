import { HttpTypes } from "@medusajs/types"
import { Region } from "@medusajs/medusa"
import ProductPreview from "@modules/products/components/product-preview"

// Типы пропсов теперь включают регион
type FeaturedProductsProps = {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion | Region // Добавляем регион
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ collections, region }) => {
  return (
    <div className="py-12">
      <div className="content-container py-12">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-base-regular text-ui-fg-base mb-6">Новинки</span>
          <p className="text-2xl-regular text-ui-fg-subtle max-w-lg">
            Каждый сезон мы представляем новые товары. Следите за нашими новинками.
          </p>
        </div>
        <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-4 gap-y-8">
          {collections.map((collection) =>
            collection.products?.map((product) => (
              <li key={product.id}>
                {/* Передаем регион в ProductPreview */}
                <ProductPreview productPreview={product} region={region} isFeatured />
    </li>
  ))
          )}
        </ul>
      </div>
    </div>
  )
}

export default FeaturedProducts
