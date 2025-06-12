import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getRegion } from "@lib/data/regions"
import { listProductsWithInventory } from "@lib/data/products"
import NewArrivalsClient from "@modules/new-arrivals/templates/new-arrivals-client"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export const metadata: Metadata = {
  title: "Новинки",
  description: "Последние поступления товаров в нашем интернет-магазине Ugodo",
}

export default async function NewArrivalsPage({ 
  params 
}: { 
  params: { countryCode: string } 
}) {
  const { countryCode } = params
  const region = await getRegion(countryCode)

  if (!region) {
    return notFound()
  }

  let products: any[] = []
  let count = 0

  try {
    const { response } = await listProductsWithInventory({
      regionId: region.id,
      queryParams: {
        limit: 500,
        order: "-created_at",
        fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+prices,*categories.id,*categories.name,*categories.handle,+type",
      },
    })
    
    const flaggedProducts = response.products.filter(product => 
      product.metadata?.is_new === "true"
    )
    
    if (flaggedProducts.length > 0) {
      products = flaggedProducts
      count = flaggedProducts.length
    } else {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const recentProducts = response.products.filter(product => {
        if (!product.created_at) return false
        const createdDate = new Date(product.created_at)
        return createdDate >= sevenDaysAgo
      })
      
      products = recentProducts.length > 0 ? recentProducts : response.products.slice(0, 20)
      count = products.length
    }
  } catch (err) {
    console.error("Ошибка при загрузке новинок:", err)
  }

  return (
    <div className="flex flex-col gap-0 bg-gray-50 min-h-screen">
      <Suspense fallback={<SkeletonProductGrid />}>
        <NewArrivalsClient
          countryCode={countryCode}
          products={products}
          totalCount={count}
          region={region}
        />
      </Suspense>
    </div>
  )
} 