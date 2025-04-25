import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@medusajs/ui"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import Hero from "@modules/home/components/hero"
import CategoryStories from "@modules/home/components/category-stories"
import ProductSection from "@modules/home/components/product-section"
import WishlistDiscountBanner from "@modules/home/components/wishlist-discount-banner"
import InfoBanner from "@modules/home/components/banners"
import DeliveryFeatures from "@modules/home/components/delivery-feature"
import { HomeTopBanner, HomeMiddleBanner } from "@modules/banner/components"

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

  // Получаем новинки
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

  // Получаем товары со скидкой
  const { response: { products: saleProducts } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 4,
    },
  }).catch(err => {
    console.error("Ошибка при загрузке товаров со скидкой:", err)
    return { response: { products: [] } }
  })

  // Получаем популярные товары
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

  return (
    <div className="flex flex-col gap-0">
      {/* Главный баннер верхней части страницы */}
      <HomeTopBanner className="mb-8" />
      
      {/* Главный слайдер-баннер */}
      <Hero />
      
      {/* Блок Stories для категорий */}
      <Container className="py-8 md:py-12">
        <CategoryStories />
      </Container>
      
      {/* Секция с новинками */}
      <Container className="py-8 md:py-12">
        <ProductSection 
          title="Новинки" 
          products={newProducts} 
          region={region}
          link={{ href: "/collections/new-arrivals", text: "Все новинки" }}
        />
      </Container>
      
      {/* Промо-баннер в середине страницы */}
      <HomeMiddleBanner className="my-8" />
      
      {/* Заменяем старый PromoBanner на новый WishlistDiscountBanner */}
      <WishlistDiscountBanner />
      
      {/* Секция со скидками */}
      <Container className="py-8 md:py-12">
        <ProductSection 
          title="Специальные предложения" 
          products={saleProducts.slice(0, 4)} 
          region={region}
          link={{ href: "/collections/sale", text: "Все акции" }}
          variant="colored"
        />
      </Container>
      
      {/* Информационный баннер о скидках */}
      <Container className="py-8 md:py-12">
        <InfoBanner 
          title="Скидки до 50%"
          description="Выбирайте из широкого ассортимента товаров по привлекательным ценам"
          variant="secondary"
        />
      </Container>
      
      {/* Секция с популярными товарами */}
      <Container className="py-8 md:py-12">
        <ProductSection 
          title="Популярное" 
          products={popularProducts} 
          region={region}
          link={{ href: "/collections/popular", text: "Смотреть все" }}
        />
      </Container>
      
      {/* Блок с преимуществами магазина */}
      <Container className="py-8 md:py-12">
        <DeliveryFeatures />
      </Container>
    </div>
  )
}
