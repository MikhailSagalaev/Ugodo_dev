import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { getRegion } from "@lib/data/regions"
import { listProductsWithInventory } from "@lib/data/products"
import BestsellersClient from "@modules/bestsellers/templates/bestsellers-client"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"

export const metadata: Metadata = {
  title: "Хиты продаж",
  description: "Самые популярные товары в нашем интернет-магазине Ugodo",
}

export default async function BestsellersPage({ 
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
        order: "-updated_at",
        fields: "*variants.calculated_price,+variants.inventory_quantity,+metadata,+tags,+prices,*categories.id,*categories.name,*categories.handle,+type",
      },
    })
    
    const flaggedProducts = response.products.filter(product => 
      product.metadata?.is_hit === "true"
    )
    
    if (flaggedProducts.length > 0) {
      products = flaggedProducts
      count = flaggedProducts.length
    } else {
      const productsWithRating = response.products.filter(product => 
        product.metadata?.rating && parseFloat(product.metadata.rating as string) > 0
      )
      
      if (productsWithRating.length > 0) {
        products = productsWithRating.sort((a, b) => {
          const ratingA = parseFloat(a.metadata?.rating as string || '0')
          const ratingB = parseFloat(b.metadata?.rating as string || '0')
          return ratingB - ratingA
        })
        count = products.length
      } else {
        products = response.products.slice(0, 20)
        count = products.length
      }
    }
  } catch (err) {
    console.error("Ошибка при загрузке хитов продаж:", err)
  }

  return (
    <div className="flex flex-col gap-0 bg-gray-50 min-h-screen">
      <Suspense fallback={<SkeletonProductGrid />}>
        <BestsellersClient
          countryCode={countryCode}
          products={products}
          totalCount={count}
          region={region}
        />
      </Suspense>
    </div>
  )
} 