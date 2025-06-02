import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductReviews from "@modules/products/components/product-reviews"
import ProductDetailsClient from "@modules/products/components/product-details-client"

// Возвращаем импорт ProductTemplate
import ProductTemplate from "@modules/products/templates"

// sdk и HttpTypes могут быть не нужны, если не используются в generateStaticParams напрямую
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
}

// generateStaticParams оставляем текущую (более сложную) версию
export async function generateStaticParams() { 
    try {
    // Получаем список регионов БЕЗ использования cookies или auth headers
    const regions = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      cache: "force-cache", // Используем кэш для сборки
    }).then(res => res.regions).catch(() => null); // Обрабатываем ошибку тихо

    if (!regions) {
      console.warn("Не удалось получить регионы для generateStaticParams. Генерация путей может быть неполной.");
      return [];
    }

    const countryCodes = regions.map((r) => r.countries?.map((c) => c.iso_2)).flat().filter(Boolean) as string[];

    if (!countryCodes || countryCodes.length === 0) {
      console.warn("Не найдено кодов стран в регионах для generateStaticParams.");
      return [];
    }

    // Получаем хэндлы продуктов для КАЖДОГО региона/кода страны,
    // так как доступность продуктов может отличаться.
    // Используем Promise.all для параллельных запросов.
    const productHandlesPromises = countryCodes.map(async (code) => {
      // Находим ID региона для данного кода страны
      const region = regions.find(reg => reg.countries?.some(c => c.iso_2 === code));
      if (!region) return []; // Пропускаем, если регион не найден
      
      // Запрашиваем хэндлы продуктов для этого региона
      const products = await sdk.client.fetch<{ products: { handle: string | null }[]; count: number }>(
        `/store/products`,
        {
          method: "GET",
          query: { region_id: region.id, fields: "handle", limit: 1000 }, // Увеличим лимит, если нужно
          cache: "force-cache", // Используем кэш для сборки
        }
      ).then(res => res.products).catch(() => null); // Обрабатываем ошибку тихо

      if (!products) return [];

      // Возвращаем массив объектов { countryCode, handle } для этого региона
      return products
        .filter(p => p.handle)
        .map(p => ({ countryCode: code, handle: p.handle! }));
    });

    const handlesByCountry = await Promise.all(productHandlesPromises);
    
    // Объединяем все массивы в один и возвращаем
    return handlesByCountry.flat();

  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${ 
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

// generateMetadata оставляем текущую версию с 'as any'
export async function generateMetadata(props: Props): Promise<Metadata> { 
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle } as any,
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  return {
    title: `${product.title} | Medusa Store`,
    description: `${product.title}`,
    openGraph: {
      title: `${product.title} | Medusa Store`,
      description: `${product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  // listProducts оставляем текущую версию с 'as any'
  const pricedProduct = await listProducts({ 
    countryCode: params.countryCode,
    queryParams: { handle: params.handle } as any,
  }).then(({ response }) => response.products[0])

  if (!pricedProduct) {
    notFound()
  }

  // Получаем продукт с количеством товаров на сервере
  let productWithInventory = pricedProduct;
  try {
    const { product } = await sdk.store.product.retrieve(pricedProduct.id, {
      fields: `*variants.calculated_price,+variants.inventory_quantity,*categories.id,*categories.name,*categories.handle,*categories.parent_category.id,*categories.parent_category.name,*categories.parent_category.handle`,
    });
    productWithInventory = product;
  } catch (error) {
    console.error('Ошибка получения количества товаров на сервере:', error);
    // Используем исходный продукт если не удалось получить количество
  }

  // Возвращаем рендеринг ProductTemplate
  return (
    <ProductTemplate
      product={productWithInventory}
      region={region}
      countryCode={params.countryCode}
    />
  )
}
