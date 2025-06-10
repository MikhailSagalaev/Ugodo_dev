import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container, Heading } from "@medusajs/ui"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts, listProductsWithInventory } from "@lib/data/products"
import Hero from "@modules/home/components/hero"
import CategoryStories from "@modules/home/components/category-stories"
import ProductSection from "@modules/home/components/product-section"
import PromotionsSlider from "@modules/home/components/promotions-slider"
// import WishlistDiscountBanner from "@modules/home/components/wishlist-discount-banner"
// import InfoBanner from "@modules/home/components/banners"
import DeliveryFeatures from "@modules/home/components/delivery-feature"
import { HomeTopBanner, HomeMiddleBanner } from "@modules/banner/components"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import ProductPreview from "@modules/products/components/product-preview"
import ProductSlider from "@modules/home/components/product-slider"
import CategoryShowcase from "@modules/home/components/category-showcase"
import MarketplaceBestsellers from "@modules/home/components/marketplace-bestsellers"
import { MobilePromoBar } from "@modules/mobile/components"

export const metadata: Metadata = {
  title: "Интернет-магазин Ugodo",
  description: "Все для вашего дома с доставкой на дом.",
}

export default async function Home({ params }: { params: { countryCode: string }}) {
  const { countryCode } = params
  const region = await getRegion(countryCode)

  if (!region) {
    return notFound()
  }

  const { response: { products: newProducts } } = await listProductsWithInventory({
    regionId: region.id,
    queryParams: {
      limit: 8,
      order: "-created_at"
    },
  }).catch(err => {
    console.error("Ошибка при загрузке новых продуктов:", err)
    return { response: { products: [] } }
  })

  const { response: { products: saleProducts } } = await listProductsWithInventory({
    regionId: region.id,
    queryParams: {
      limit: 4,
    },
  }).catch(err => {
    console.error("Ошибка при загрузке товаров со скидкой:", err)
    return { response: { products: [] } }
  })

  const { response: { products: popularProducts } } = await listProductsWithInventory({
    regionId: region.id,
    queryParams: {
      limit: 8,
      order: "-updated_at",
    },
  }).catch(err => {
    console.error("Ошибка при загрузке популярных товаров:", err)
    return { response: { products: [] } }
  })

  const homeGardenProducts = newProducts.slice(0, 8)

  const marketplaceBestsellers = popularProducts.slice(0, 8)

  const { response: { products: catalogProducts, count: totalCount } } = await listProductsWithInventory({
    regionId: region.id,
    queryParams: {
      limit: 15,
      order: "-created_at"
    },
  }).catch(err => {
    console.error("Ошибка при загрузке каталога товаров:", err)
    return { response: { products: [], count: 0 } }
  })

  return (
    <>
      <div className="flex flex-col gap-0 bg-gray-50 min-h-screen">
        <div className="pt-6">
          <Hero />
        </div>
        
        <div style={{ backgroundColor: '#f3f4f6', paddingTop: '8px', paddingBottom: '8px' }}>
          <Container>
            <CategoryStories />
          </Container>
        </div>
        
        <ProductSlider 
          title="НОВИНКИ" 
          products={newProducts} 
          region={region}
        />
        
        <PromotionsSlider />
        

        
        <CategoryShowcase
          title="Дом и сад"
          products={homeGardenProducts}
          region={region}
        />
        
        <ProductSlider 
          title="ПОПУЛЯРНОЕ" 
          products={popularProducts} 
          region={region}
        />
        
        {/* <WishlistDiscountBanner /> */}
        
        <MarketplaceBestsellers
          title="Хиты продаж на маркетплейсах"
          products={marketplaceBestsellers}
          region={region}
        />
        
        <div style={{ backgroundColor: '#f3f4f6' }}>
          <section style={{ paddingTop: '16px', paddingBottom: '16px' }}>
            <div className="content-container px-0 sm:px-4 md:px-8 relative" style={{ backgroundColor: '#f8f9fa', borderRadius: '32px' }}>
              <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-0" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
                <Heading level="h2" className="text-2xl md:text-3xl font-bold uppercase mb-8">КАТАЛОГ ТОВАРОВ</Heading>
                <PaginatedProducts 
                  initialProducts={catalogProducts}
                  totalCount={totalCount}
                  countryCode={countryCode}
                  region={region}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <MobilePromoBar />
    </>
  )
}
