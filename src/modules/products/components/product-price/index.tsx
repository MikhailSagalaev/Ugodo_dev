import { HttpTypes } from "@medusajs/types"
import { clx, Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { Region } from "@medusajs/medusa"

// Определяем тип пропсов для ProductPrice
type ProductPriceProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant // Вариант опционален
  region: HttpTypes.StoreRegion | Region // Регион обязателен
  className?: string
}

export default function ProductPrice({
  product,
  variant,
  region,
  className,
}: ProductPriceProps) {
  // Получаем расширенные данные о ценах
  const {
    cheapestPrice,
    variantPrice,
    minPriceAmount,
    maxPriceAmount,
  } = getProductPrice({
    product,
    variantId: variant?.id, 
    region,
  })

  // Выбираем цену для отображения (логика остается прежней)
  const selectedPrice = variant ? variantPrice : cheapestPrice

  // Проверяем, что есть числовая цена для рендеринга
  if (!selectedPrice || typeof selectedPrice.calculated_amount === 'undefined') {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  // Определяем, нужно ли показывать "От"
  const showFromPrefix = !variant && 
                         product.variants && 
                         product.variants.length > 1 && 
                         minPriceAmount !== maxPriceAmount;

  // Формируем строку цены
  const formattedPrice = selectedPrice.calculated_price.replace(/[^\d,]/g, '');
  
  return (
    <div className={clx("flex items-center", className)}>
      {/* Отображаем цену с правильным форматированием и префиксом "От" */}
      <span
        className="text-4xl font-medium"
        data-testid="product-price"
      >
        {formattedPrice} ₽
      </span>
      
      {/* Отображаем старую зачеркнутую цену рядом, если это распродажа и цена действительно отличается */}
      {selectedPrice.price_type === 'sale' && selectedPrice.original_amount && selectedPrice.original_amount > selectedPrice.calculated_amount && (
        <div className="ml-3">
          <span className="text-sm">{selectedPrice.original_price}</span>
          <span className="text-xs text-gray-500 ml-1">по максимальной карте</span>
        </div>
      )}
    </div>
  )
}
