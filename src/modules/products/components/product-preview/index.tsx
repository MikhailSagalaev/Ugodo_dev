import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import ProductPreviewClient from "@modules/products/components/product-preview/product-preview-client"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  // Логирование полученных данных для отладки
  console.log("Server | ProductPreview | Product:", product.id, product.title);
  console.log("Server | ProductPreview | CheapestPrice:", cheapestPrice);
  
  // Определяем категорию продукта (первый тег или коллекция)
  const category = product.collection?.title || 
                  (product.tags && product.tags.length > 0 ? product.tags[0].value : "Товар")

  // Определяем бейджи для продукта
  const badges = []

  // Если у продукта есть скидка
  let discountPercentage = 0
  if (cheapestPrice && cheapestPrice.price_type === "sale") {
    discountPercentage = Math.round(
      ((cheapestPrice.original_price_number - cheapestPrice.calculated_price_number) / cheapestPrice.original_price_number) * 100
    )
    badges.push({ 
      id: 'discount', 
      text: `${discountPercentage}`, 
      color: 'bg-yellow-400 text-black' 
    })
    
    console.log("Server | ProductPreview | DiscountPercentage:", discountPercentage);
  }

  // Проверяем наличие продукта
  const isInStock = product.variants?.some(v => (v.inventory_quantity ?? 0) > 0) ?? true
  const deliveryInfo = isInStock ? "В течение часа" : "Нет в наличии"

  // Если продукт новый (за последние 30 дней)
  const isNew = product.created_at && 
                new Date(product.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
  
  // Проверяем, есть ли видео у продукта
  const hasVideo = product.metadata && product.metadata.has_video === true ? true : false

  // Подготовим все данные для передачи в клиентский компонент
  const productData = {
    id: product.id,
    handle: product.handle,
    title: product.title,
    thumbnail: product.thumbnail,
    images: product.images || [],
    hasVideo,
    category,
    badges,
    isInStock,
    deliveryInfo,
    cheapestPrice,
  }

  // Логирование данных, отправляемых в клиентский компонент
  console.log("Server | ProductPreview | ProductData:", {
    id: productData.id,
    title: productData.title,
    badges: productData.badges,
    cheapestPrice: productData.cheapestPrice ? {
      price_type: productData.cheapestPrice.price_type,
      calculated_price: productData.cheapestPrice.calculated_price,
      original_price: productData.cheapestPrice.original_price
    } : null
  });

  return (
    <ProductPreviewClient 
      product={productData} 
      isFeatured={isFeatured} 
    />
  )
}
