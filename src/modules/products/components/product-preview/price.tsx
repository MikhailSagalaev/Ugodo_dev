import { Text, clx } from "@medusajs/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <div className="flex flex-col items-end relative">
      {price.price_type === "sale" && (
        <Text
          className="text-sm line-through opacity-50"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className="text-base font-semibold"
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
      {price.price_type === "sale" && (
        <div className="w-full h-0.5 bg-[#07C4F5] absolute -rotate-6 bottom-[9px]"></div>
      )}
    </div>
  )
}
