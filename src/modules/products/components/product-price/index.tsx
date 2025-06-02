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

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice || typeof selectedPrice.calculated_amount === 'undefined') {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  const showFromPrefix = !variant && 
                         product.variants && 
                         product.variants.length > 1 && 
                         minPriceAmount !== maxPriceAmount;

  const formattedPrice = selectedPrice.calculated_price.replace(/[^\d,]/g, '');
  
  const hasDiscount = selectedPrice.price_type === 'sale' && 
                     selectedPrice.original_amount && 
                     selectedPrice.original_amount > selectedPrice.calculated_amount;

  const discountPercentage = hasDiscount && selectedPrice.original_amount
    ? Math.round(((selectedPrice.original_amount - selectedPrice.calculated_amount) / selectedPrice.original_amount) * 100)
    : 0;

  return (
    <div className={clx("flex", className)}>
      <div className="flex flex-col">
        <span
          className="text-[30px] font-[500]"
          data-testid="product-price"
        >
          {formattedPrice} ₽
        </span>
        {hasDiscount && (
          <span 
            className="text-[#C2E7DA] text-[14px] leading-[1.1] lowercase"
          >
            со скидкой {discountPercentage}%
          </span>
        )}
      </div>
      
      {hasDiscount && (
        <div className="flex flex-col ml-3">
          <span 
            className="text-[30px] font-[500] line-through"
            style={{
              color: "#b3b3b3"
            }}
          >
            {selectedPrice.original_price?.replace(/[^\d,]/g, '')} ₽
          </span>
          <span 
            className="text-[14px] leading-[1.1] lowercase"
            style={{
              color: "#b3b3b3"
            }}
          >
            без скидки
          </span>
        </div>
      )}
    </div>
  )
}
