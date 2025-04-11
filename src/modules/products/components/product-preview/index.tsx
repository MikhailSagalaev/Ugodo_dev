import { Text } from "@medusajs/ui"
import { listProducts } from "@lib/data/products"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { Plus } from "@medusajs/icons"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  // const pricedProduct = await listProducts({
  //   regionId: region.id,
  //   queryParams: { id: [product.id!] },
  // }).then(({ response }) => response.products[0])

  // if (!pricedProduct) {
  //   return null
  // }

  const { cheapestPrice } = getProductPrice({
    product,
  })

  // Определяем бейджи для продукта
  const badges = []

  // Если продукт новый (можно настроить логику)
  if (product.created_at && new Date(product.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) {
    badges.push({ id: 'new', text: 'Новинка', color: 'bg-cyan-400 text-black' })
  }

  // Если у продукта есть скидка
  if (cheapestPrice && cheapestPrice.price_type === "sale") {
    const discountPercentage = Math.round(
      ((cheapestPrice.original_amount - cheapestPrice.calculated_amount) / cheapestPrice.original_amount) * 100
    )
    badges.push({ 
      id: 'discount', 
      text: `-${discountPercentage}%`, 
      color: 'bg-lime-400 text-black' 
    })
  }

  return (
    <div className="group relative">
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-square mb-2">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
          
          {/* Бейджи */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {badges.map((badge) => (
              <span 
                key={badge.id}
                className={`text-xs px-2 py-1 rounded-sm ${badge.color}`}
              >
                {badge.text}
              </span>
            ))}
          </div>
          
          {/* Кнопка добавления в корзину */}
          <button 
            className="absolute bottom-2 right-2 bg-black rounded-full w-8 h-8 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Добавить в корзину"
          >
            <Plus />
          </button>
        </div>
        
        <div className="flex text-sm mt-2 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {product.title}
          </Text>
          <div className="flex items-center gap-x-2">
            {cheapestPrice && <PreviewPrice price={cheapestPrice} />}
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
