import { notFound } from "next/navigation"
import { getRegion } from "@lib/data/regions"
import { listProductsWithInventory } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { HttpTypes } from "@medusajs/types"
import CategoryClient from "./category-client"
import SupportButton from "@modules/common/components/support-button"

// Рекурсивная функция для получения всех подкатегорий
function getAllSubcategories(
  categoryId: string, 
  allCategories: HttpTypes.StoreProductCategory[]
): HttpTypes.StoreProductCategory[] {
  const directSubcategories = allCategories.filter(cat => cat.parent_category_id === categoryId)
  let allSubcategories = [...directSubcategories]
  
  // Рекурсивно добавляем подкатегории каждой найденной подкатегории
  directSubcategories.forEach(subcat => {
    const nestedSubcategories = getAllSubcategories(subcat.id, allCategories)
    allSubcategories = [...allSubcategories, ...nestedSubcategories]
  })
  
  return allSubcategories
}

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

  const allCategories = await listCategories().catch(() => [])
  
  const directSubcategories = allCategories.filter((cat: HttpTypes.StoreProductCategory) => 
    cat.parent_category_id === category.id
  )
  
  const allSubcategories = getAllSubcategories(category.id, allCategories)
  
  const categoryIds = [category.id, ...allSubcategories.map((sub: HttpTypes.StoreProductCategory) => sub.id)]

  let products: HttpTypes.StoreProduct[] = []
  let count = 0

  try {
    const { response } = await listProductsWithInventory({
      regionId: region.id,
      queryParams: {
        limit: 500,
        category_id: categoryIds,
        fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+prices,*categories.id,*categories.name,*categories.handle,+type",
      } as HttpTypes.StoreProductParams,
    })
    products = response.products
    count = response.count
    
    if (products.length === 0 && categoryIds.length > 1) {
      const allProductsPromises = categoryIds.map(async (catId) => {
        try {
          const { response } = await listProductsWithInventory({
            regionId: region.id,
            queryParams: {
              limit: 500,
              category_id: [catId],
              fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+prices,*categories.id,*categories.name,*categories.handle,+type",
            } as HttpTypes.StoreProductParams,
          })
          return response.products
        } catch (error) {
          console.error(`Ошибка загрузки товаров для категории ${catId}:`, error)
          return []
        }
      })
      
      const allProductsArrays = await Promise.all(allProductsPromises)
      const allProducts = allProductsArrays.flat()
      
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      )
      
      products = uniqueProducts
      count = uniqueProducts.length
    }
    
  } catch (err) {
    console.error("Ошибка при загрузке товаров категории:", err)
  }

  const totalCount = products.length

  return (
    <>
      <CategoryClient
        category={category}
        countryCode={countryCode}
        products={products}
        totalCount={totalCount}
        subcategories={directSubcategories}
        region={region}
        categoryIds={categoryIds}
        allCategories={allCategories}
      />
      <SupportButton />
    </>
  )
}
