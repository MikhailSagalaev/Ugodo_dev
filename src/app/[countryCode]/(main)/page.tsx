import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@medusajs/ui"

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
import PaginatedProducts from "@modules/store/components/product-list"
import ProductPreview from "@modules/products/components/product-preview"

export const metadata: Metadata = {
  title: "Интернет-магазин Ugodo",
  description: "Все для вашего дома с доставкой на дом.",
}

export default async function Home({ params }: { params: { countryCode: string }}) {
  // Возвращаем деструктуризацию params
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
      {/* Главный баннер верхней части страницы - УДАЛЕН */}
      
      {/* Главный слайдер-баннер */}
      <Hero />
      
      {/* Блок Stories для категорий */}
      <CategoryStories />
      
      {/* Секция с новинками */}
      <div className="py-8 md:py-12">
        <ProductSection 
          title="Новинки" 
          products={newProducts} 
          region={region}
          link={{ href: "/collections/new-arrivals", text: "Все новинки" }}
        />
      </div>
      
      {/* Выносим PromotionsSlider из Container для полной ширины */}
      <PromotionsSlider />
      
      {/* Оборачиваем PromotionsSlider в Container */}
      {/* <Container className="py-8 md:py-12">
        <PromotionsSlider />
      </Container> */}
      
      {/* Промо-баннер в середине страницы */}
      <HomeMiddleBanner className="my-8" />
      
      {/* Секция с популярными товарами */}
      <div className="py-8 md:py-12">
        <ProductSection 
          title="Популярное" 
          products={popularProducts} 
          region={region}
          link={{ href: "/collections/popular", text: "Смотреть все" }}
        />
      </div>
      
      {/* Выносим WishlistDiscountBanner из Container */}
      <WishlistDiscountBanner />
      
      {/* Добавляем блок каталога с пагинацией */}
      <div className="py-8 md:py-12">
        <div className="content-container mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Каталог товаров</h2>
        </div>
        <PaginatedProducts 
          page={1} // Начинаем с первой страницы
          countryCode={countryCode} 
          // sortBy="created_at" // Можно добавить сортировку, если нужно
        />
      </div>
      
      {/* Блок с преимуществами магазина - УДАЛЯЕМ */}
      {/* 
      <Container className="py-8 md:py-12">
        <DeliveryFeatures />
      </Container>
      */}
    </div>
  )
}
