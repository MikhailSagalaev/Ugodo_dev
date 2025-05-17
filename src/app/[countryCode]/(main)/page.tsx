import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Container } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { getTagByValue } from "@lib/data/tags"
import Hero from "@modules/home/components/hero"
import CategoryStories from "@modules/home/components/category-stories"
import PopularCategories from "@modules/home/components/popular-categories"
import ProductSection from "@modules/home/components/product-section"
import PromotionsSlider from "@modules/home/components/promotions-slider"
import FeaturedBrands from "@modules/home/components/featured-brands"
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

  // Получаем тег 'bestseller'
  const bestsellerTag = await getTagByValue('bestseller');

  // Получаем популярные товары (хиты продаж) по тегу 'bestseller'
  let bestsellerProducts: HttpTypes.StoreProduct[] = [];
  if (bestsellerTag && bestsellerTag.id) {
    const queryParamsForBestsellers = {
      limit: 8,
      tags: [bestsellerTag.id] 
    };
    const { response } = await listProducts({
      regionId: region.id,
      queryParams: queryParamsForBestsellers as any,
    }).catch(err => {
      console.error("Ошибка при загрузке хитов продаж:", err)
      return { response: { products: [] } }
    });
    bestsellerProducts = response.products;
  } else {
    console.warn("Тег 'bestseller' не найден. Блок хитов продаж может быть пустым.")
  }

  // Получаем родительские категории для блока "Популярные категории"
  const productCategories = await listCategories({
    parent_category_id: "null",
    limit: 6
  }).catch((err) => {
    console.error("Ошибка при загрузке категорий:", err)
    return []
  })

  // Получаем коллекции (бренды) для блока "Популярные бренды"
  const { collections: brandCollections } = await listCollections({
    limit: "12" // Ограничиваем количество, как в компоненте
  }).catch(err => {
    console.error("Ошибка при загрузке коллекций (брендов):", err);
    return { collections: [], count: 0, limit: 12, offset: 0 }; // Возвращаем совместимую структуру
  });

  return (
    <div className="flex flex-col gap-0">
      {/* Главный баннер верхней части страницы - УДАЛЕН */}
      
      {/* Заменяем HeroBanner на Hero */}
      <Hero />
      
      {/* Блок Stories для категорий */}
      <CategoryStories />
      
      {/* Блок Популярные категории */}
      {productCategories && productCategories.length > 0 && (
        <PopularCategories categories={productCategories} countryCode={countryCode} />
      )}
      
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
      
      {/* Секция с популярными товарами (хитами продаж) */}
      <div className="py-8 md:py-12">
        <ProductSection 
          title="Хиты продаж"
          products={bestsellerProducts}
          region={region}
          link={{ href: "/bestsellers", text: "Все хиты продаж" }}
        />
      </div>
      
      {/* Блок Популярные бренды */}
      {brandCollections && brandCollections.length > 0 && (
        <FeaturedBrands collections={brandCollections} countryCode={countryCode} />
      )}
      
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
