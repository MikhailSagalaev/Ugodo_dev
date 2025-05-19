import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container, Heading } from "@medusajs/ui"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import Hero from "@modules/home/components/hero"
import CategoryStories from "@modules/home/components/category-stories"
import ProductSection from "@modules/home/components/product-section"
import PromotionsSlider from "@modules/home/components/promotions-slider"
import WishlistDiscountBanner from "@modules/home/components/wishlist-discount-banner"
import InfoBanner from "@modules/home/components/banners"
import DeliveryFeatures from "@modules/home/components/delivery-feature"
import { HomeTopBanner, HomeMiddleBanner } from "@modules/banner/components"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import ProductPreview from "@modules/products/components/product-preview"
import ProductSlider from "@modules/home/components/product-slider"
import CategoryShowcase from "@modules/home/components/category-showcase"
import MarketplaceBestsellers from "@modules/home/components/marketplace-bestsellers"

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

  const { response: { products: newProducts } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 8,
      order: "-created_at"
    },
  }).catch(err => {
    console.error("Ошибка при загрузке новых продуктов:", err)
    return { response: { products: [] } }
  })

  const { response: { products: saleProducts } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 4,
    },
  }).catch(err => {
    console.error("Ошибка при загрузке товаров со скидкой:", err)
    return { response: { products: [] } }
  })

  const { response: { products: popularProducts } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 8,
      order: "-updated_at",
    },
  }).catch(err => {
    console.error("Ошибка при загрузке популярных товаров:", err)
    return { response: { products: [] } }
  })

  // Для блока "Дом и сад" используем часть новых товаров, так как нет специального фильтра
  const homeGardenProducts = newProducts.slice(0, 8)

  // Для блока "Хиты продаж на маркетплейсах" используем популярные товары
  const marketplaceBestsellers = popularProducts.slice(0, 8)

  const { response: { products: catalogProducts, count: totalCount } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 16,
    },
  }).catch(err => {
    console.error("Ошибка при загрузке каталога товаров:", err)
    return { response: { products: [], count: 0 } }
  })

  return (
    <div className="flex flex-col gap-0">
      <Hero />
      
      <Container className="pt-2 pb-1">
        <CategoryStories />
      </Container>
      
      <Container className="pt-2 pb-6">
        <ProductSlider 
          title="НОВИНКИ" 
          products={newProducts} 
          region={region}
        />
      </Container>
      
      <PromotionsSlider />
      
      <HomeMiddleBanner className="my-8" />
      
      <CategoryShowcase
        title="Дом и сад"
        products={homeGardenProducts}
        region={region}
      />
      
      <Container className="py-8 md:py-12">
        <ProductSlider 
          title="ПОПУЛЯРНОЕ" 
          products={popularProducts} 
          region={region}
        />
      </Container>
      
      <WishlistDiscountBanner />
      
      <MarketplaceBestsellers
        title="Хиты продаж на маркетплейсах"
        products={marketplaceBestsellers}
        region={region}
      />
      
      <Container className="py-8 md:py-12">
        <div className="w-full max-w-[1360px] mx-auto">
          <Heading level="h2" className="text-2xl md:text-3xl font-bold uppercase mb-8">КАТАЛОГ ТОВАРОВ</Heading>
          <PaginatedProducts 
            initialProducts={catalogProducts}
            totalCount={totalCount}
            countryCode={countryCode}
            region={region}
          />
        </div>
      </Container>
    </div>
  )
}
