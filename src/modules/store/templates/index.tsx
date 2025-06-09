import { getRegion } from "@lib/data/regions"
import { listProductsWithInventory } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import StoreClient from "./store-client"

const StoreTemplate = async ({
  countryCode,
}: {
  countryCode: string
}) => {
  const region = await getRegion(countryCode)
  
  if (!region) {
    return <div>Регион не найден</div>
  }

  const { response: { products, count: totalCount } } = await listProductsWithInventory({
    regionId: region.id,
    queryParams: {
      limit: 999999,
    },
  }).catch(err => {
    console.error("Ошибка при загрузке товаров:", err)
    return { response: { products: [], count: 0 } }
  })

  const allCategories = await listCategories().catch(() => [])
  const categories = allCategories.slice(0, 8)

  return (
    <StoreClient
      countryCode={countryCode}
      products={products}
      totalCount={totalCount}
      categories={categories}
      region={region}
    />
  )
}

export default StoreTemplate
