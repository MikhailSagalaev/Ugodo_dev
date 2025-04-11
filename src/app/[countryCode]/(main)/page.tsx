import { Metadata } from "next"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import Hero from "@modules/home/components/hero"
import CategoryNavigation from "@modules/home/components/category-navigation"
import ProductSection from "@modules/home/components/product-section"
import PromoBanner from "@modules/home/components/promo-banner"

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
    return null
  }

  // Получаем новинки
  const { response: { products: newProducts } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 8,
      order: "-created_at"
    },
  })

  // Получаем товары со скидкой - исправлено
  const { response: { products: saleProducts } } = await listProducts({
    regionId: region.id,
    queryParams: {
      limit: 4,
      // Сначала получаем все товары без параметра фильтрации
      // В компоненте карточки товара уже есть логика определения скидки
    },
  })

  // Фильтруем товары со скидкой на стороне клиента
  const filteredSaleProducts = saleProducts.filter(product => {
    // Используем логику из product-preview/index.tsx для определения скидки
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
  })

  return (
    <>
      <Hero />
      <CategoryNavigation />
      
      <ProductSection 
        title="Новинки" 
        products={newProducts} 
        region={region}
        link={{ href: "/collections/new-arrivals", text: "Все новинки" }}
      />
      
      <PromoBanner 
        title="Все, что нужно"
        subtitle="Стильные решения для вашего дома"
        buttonText="Смотреть коллекцию"
        buttonLink="/collections/home-essentials"
        imageUrl="/images/promo-banner.jpg"
      />
      
      <ProductSection 
        title="Акции" 
        products={filteredSaleProducts.length > 0 ? filteredSaleProducts : saleProducts.slice(0, 4)} 
        region={region}
        link={{ href: "/collections/sale", text: "Все акции" }}
        variant="colored"
      />
      
      <div className="content-container my-8 py-8 bg-neutral-100 text-center">
        <h2 className="text-xl mb-2">Бo скидками до -50%</h2>
        <p className="mb-0">Успейте купить по выгодной цене</p>
      </div>
      
      <ProductSection 
        title="Популярное" 
        products={popularProducts} 
        region={region}
        link={{ href: "/collections/popular", text: "Смотреть все" }}
      />
      
      <div className="content-container my-8">
        <div className="py-4 text-center border-y border-neutral-200">
          <h3 className="text-lg mb-1">Экспресс доставка</h3>
          <p className="text-sm text-neutral-600 mb-0">Получите заказ в течение 24 часов</p>
        </div>
      </div>
    </>
  )
}
