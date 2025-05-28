import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import CategoryClient from "./category-client"

export default async function CategoryTemplate({
  category,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  countryCode: string
}) {
  if (!category || !countryCode) notFound()

  const region = await getRegion(countryCode)
  
  if (!region) {
    return <div>Регион не найден</div>
  }

  const { response: { products: allProducts } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 100,
      fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+prices,*categories,+type",
    },
  }).catch(err => {
    console.error("Ошибка при загрузке товаров категории:", err)
    return { response: { products: [], count: 0 } }
  })

  const filteredProducts = allProducts.filter(product => 
    product.categories && product.categories.some(cat => cat.id === category.id)
  )
  
  const totalCount = filteredProducts.length
  const products = filteredProducts.slice(0, 16)

  const allCategories = await listCategories().catch(() => [])
  const otherCategories = allCategories.filter(cat => cat.id !== category.id).slice(0, 8)

  return (
    <CategoryClient
      category={category}
      countryCode={countryCode}
      products={products}
      totalCount={totalCount}
      otherCategories={otherCategories}
      region={region}
    />
  )
}
