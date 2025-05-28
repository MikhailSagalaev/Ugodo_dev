import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
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

  const { response: { products, count: totalCount } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 16,
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
