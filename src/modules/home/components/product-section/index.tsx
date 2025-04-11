import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import ProductPreview from "@modules/products/components/product-preview"
import InteractiveLink from "@modules/common/components/interactive-link"

type ProductSectionProps = {
  title: string
  products: HttpTypes.StoreProduct[]
  region: HttpTypes.StoreRegion
  link?: {
    href: string
    text: string
  }
  variant?: "light" | "colored"
}

export default function ProductSection({ 
  title, 
  products, 
  region, 
  link, 
  variant = "light"
}: ProductSectionProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <div className={`w-full py-6 ${variant === "colored" ? "bg-neutral-100" : ""}`}>
      <div className="content-container">
        <div className="flex justify-between items-center mb-6">
          <Text className="text-xl font-medium">{title}</Text>
          {link && (
            <InteractiveLink href={link.href}>
              {link.text}
            </InteractiveLink>
          )}
        </div>
        
        <div className="grid grid-cols-2 small:grid-cols-4 gap-x-4 gap-y-8">
          {products.map((product) => (
            <div key={product.id}>
              <ProductPreview product={product} region={region} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 