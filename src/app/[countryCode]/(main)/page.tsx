import { Metadata } from "next"
import { notFound } from "next/navigation"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import Hero from "@modules/home/components/hero"
import CategoryNavigation from "@modules/home/components/category-navigation"
import ProductSection from "@modules/home/components/product-section"
import PromoBanner from "@modules/home/components/promo-banner"
import InfoBanner from "@modules/home/components/banners"
import DeliveryFeatures from "@modules/home/components/delivery-feature"

export const metadata: Metadata = {
  title: "Интернет-магазин Ugodo",
  description: "Все для вашего дома с доставкой на дом.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
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

  // Фильтруем товары со скидкой на стороне сервера
  const filteredSaleProducts = saleProducts.filter(product => {
    const variants = product.variants || []
    return variants.some(variant => 
      variant.prices?.some(price => 
        price.price_type === "sale" && price.calculated_amount < price.original_amount
      )
    )
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
      {/* Главный слайдер-баннер */}
      <Hero />
      
      {/* Блок "сторис" */}
      <CategoryNavigation />
      
      {/* Секция с новинками */}
      <ProductSection 
        title="Новинки" 
        products={newProducts} 
        region={region}
        link={{ href: "/collections/new-arrivals", text: "Все новинки" }}
      />
      
      {/* Промо-баннер */}
      <PromoBanner 
        title="Все, что нужно для вашего дома"
        subtitle="Стильные и функциональные решения для создания уюта"
        buttonText="Смотреть коллекцию"
        buttonLink="/collections/home-essentials"
        imageUrl="/placeholder.svg"
        variant="gradient"
      />
      
      {/* Секция со скидками */}
      <ProductSection 
        title="Специальные предложения" 
        products={filteredSaleProducts.length > 0 ? filteredSaleProducts : saleProducts.slice(0, 4)} 
        region={region}
        link={{ href: "/collections/sale", text: "Все акции" }}
        variant="colored"
      />
      
      {/* Информационный баннер о скидках */}
      <InfoBanner 
        title="Скидки до 50%"
        description="Выбирайте из широкого ассортимента товаров по привлекательным ценам"
        variant="secondary"
      />
      
      {/* Секция с популярными товарами */}
      <ProductSection 
        title="Популярное" 
        products={popularProducts} 
        region={region}
        link={{ href: "/collections/popular", text: "Смотреть все" }}
      />
      
      {/* Блок с преимуществами магазина */}
      <DeliveryFeatures />
    </div>
  )
}
