import { HttpTypes } from "@medusajs/types"
import { clx, Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { getCheapestVariantPerUnit } from "@lib/util/get-cheapest-per-unit"
import { getSingleUnitVariant } from "@lib/util/get-single-unit-variant"
import { Region } from "@medusajs/medusa"

type ProductPriceProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  region: HttpTypes.StoreRegion | Region
  className?: string
  quantity?: number
  showTotalPrice?: boolean
  useMinPricePerUnit?: boolean
}

export default function ProductPrice({
  product,
  variant,
  region,
  className,
  quantity = 1,
  showTotalPrice = false,
  useMinPricePerUnit = false,
}: ProductPriceProps) {
  const cheapestVariantPerUnit = getCheapestVariantPerUnit(product);
  const singleUnitVariant = getSingleUnitVariant(product);
  
  let targetVariantId: string | undefined;
  if (variant?.id) {
    targetVariantId = variant.id;
  } else if (useMinPricePerUnit) {
    targetVariantId = cheapestVariantPerUnit?.id;
  } else {
    targetVariantId = singleUnitVariant?.id;
  }
  
  const {
    cheapestPrice,
    variantPrice,
    minPriceAmount,
    maxPriceAmount,
  } = getProductPrice({
    product,
    variantId: targetVariantId, 
    region,
  })

  const selectedPrice = variant ? variantPrice : (useMinPricePerUnit ? cheapestPrice : variantPrice)

  if (!selectedPrice || typeof selectedPrice.calculated_amount === 'undefined') {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  const showFromPrefix = !variant && 
                         product.variants && 
                         product.variants.length > 1 && 
                         minPriceAmount !== maxPriceAmount;

  const unitPrice = selectedPrice.calculated_amount
  const totalAmount = showTotalPrice ? unitPrice * quantity : unitPrice
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: region.currency_code?.toUpperCase() || 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/[^\d\s]/g, '')
  }

  const formattedPrice = formatPrice(totalAmount)
  
  const hasDiscount = selectedPrice.price_type === 'sale' && 
                     selectedPrice.original_amount && 
                     selectedPrice.original_amount > selectedPrice.calculated_amount;

  const discountPercentage = hasDiscount && selectedPrice.original_amount
    ? Math.round(((selectedPrice.original_amount - selectedPrice.calculated_amount) / selectedPrice.original_amount) * 100)
    : 0;

  const hasQuantityOption = product.options?.some(option => 
    option.title?.toLowerCase().includes('количество')
  )

  return (
    <div className={clx("flex flex-col", className)}>
      <div className="flex">
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
              {formatPrice(selectedPrice.original_amount! * (showTotalPrice ? quantity : 1))} ₽
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
      
      {showTotalPrice && hasQuantityOption && quantity > 1 && (
        <div className="text-[14px] text-gray-500 mt-1">
          {formatPrice(unitPrice)} ₽ за упаковку × {quantity} = {formattedPrice} ₽
        </div>
      )}
    </div>
  )
}
