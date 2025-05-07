"use client";

import React from "react"
import { HttpTypes } from "@medusajs/types"
// import { Region } from "@medusajs/medusa" // Не используется
import { Heading, Text, clx, Button } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import Image from "next/image"
import ProductPrice from "../product-price"
// import { Heart, ShoppingBag } from "@medusajs/icons"
// import { ProductProvider } from "@lib/context/product-context" // Убираем импорт
// import Thumbnail from "../thumbnail" // Не используется
// import Link from "next/link" // Не используется LocalizedClientLink
// import PreviewPrice from "./price" // Не используется ProductPrice
// import ProductPreviewActions from "./product-preview-actions" // Убираем импорт
import { ReactNode } from "react"

// Типы пропсов теперь включают регион
type ProductPreviewProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  isFeatured?: boolean
  categoryTitle?: string
  showVideoIcon?: (product: HttpTypes.StoreProduct) => boolean
  showTimeLabel?: (product: HttpTypes.StoreProduct) => boolean
  timeLabelPlaceholder?: ReactNode
  videoIconPlaceholder?: string
}

// Иконки-заглушки из примера
const iconImagePlaceholder = "https://cdn.builder.io/api/v1/image/assets/TEMP/d9d6f06cd7312354e842c8f627b79701654b10dc?placeholderIfAbsent=true&apiKey=61ffe663603f4de3aa93a6286a9db479"

export default function ProductPreview({
  product,
  region,
  isFeatured,
  categoryTitle,
  showVideoIcon = () => false,
  showTimeLabel = () => false,
  timeLabelPlaceholder = "В течение часа",
  videoIconPlaceholder = "/images/video-icon.svg", // Укажите путь к вашей иконке
}: ProductPreviewProps) {
  // Получаем информацию о цене и скидке
  const { cheapestPrice } = getProductPrice({
    product: product,
    region: region,
  })

  // --- Логика для метки времени/доступности --- 
  const timeLabelText = product.metadata?.duration as string 
                      || product.metadata?.availability as string 
                      || "В течение часа";
  // --- Флаг наличия товара (хотя бы одного варианта) --- 
  const isInStock = !!cheapestPrice; 

  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // Предотвращаем переход по ссылке
    // TODO: Добавить логику добавления/удаления из избранного
    console.log("Wishlist clicked for:", product.handle)
  }

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() // Предотвращаем переход по ссылке
    // TODO: Добавить логику добавления в корзину (возможно, открытие модального окна или быстрый add)
    console.log("Add to cart clicked for:", product.handle)
  }

  return (
    // --- Убираем ProductProvider --- 
    // <ProductProvider product={product}>
      <div className="flex flex-col">
        {/* Контейнер с изображением и оверлеями */}
        <LocalizedClientLink
          href={`/products/${product?.handle}`}
          className="group block relative w-full overflow-hidden aspect-square"
          role="article"
          aria-label={`View product: ${product.title}`}
        >
          {/* Фоновое изображение */}
          {product.thumbnail ? (
             <Image
              src={product.thumbnail}
              alt={product.title || "Product image"}
              fill
              sizes="(max-width: 576px) 50vw, (max-width: 768px) 33vw, (max-width: 992px) 25vw, 20vw"
              style={{ objectFit: "cover" }}
              className="absolute inset-0 size-full transition-transform duration-300 ease-in-out group-hover:scale-105"
              data-testid="product-thumbnail"
            />
          ) : (
            <div className="absolute inset-0 size-full bg-gray-100 flex items-center justify-center">
               <span className="text-gray-500 text-xs">No image</span>
            </div>
          )}

          {/* Верхний слой (скидка и кнопка "В избранное") */}
          <div className="flex absolute top-0 left-0 right-0 justify-between items-start z-10">
            {/* Скидка остается прижатой к левому верхнему краю */}
            {cheapestPrice?.price_type === 'sale' && cheapestPrice.percentage_diff && (
              <div
                className="px-2.5 py-1.5 text-sm font-semibold text-black bg-[#CBF401] leading-none rounded-br-sm"
                aria-label={`Discount: ${cheapestPrice.percentage_diff}%`}
                data-testid="product-discount-badge"
              >
                -{cheapestPrice.percentage_diff}%
              </div>
            )}
            <div className="flex-grow"></div>

            {/* Кнопка избранного с отступом сверху и справа */}
            <button
              onClick={handleWishlistClick}
              className="mt-2 mr-2 p-2 bg-blue-400 hover:bg-blue-500 transition-colors text-white rounded-md"
              aria-label="Add to wishlist"
              data-testid="product-wishlist-button"
            >
              <Image 
                src="/images/heartIcon.svg" 
                alt="В избранное" 
                width={24} 
                height={24} 
                className="brightness-0 invert"
              />
            </button>
          </div>
          
          {/* Метка времени/доступности - с отступом снизу и слева */}
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <div className="px-2.5 py-1.5 text-xs text-left text-white bg-black/60 pointer-events-auto rounded-md">
              {timeLabelText}
            </div>
          </div>

        </LocalizedClientLink>

        {/* Блок с текстом и кнопками/статусом */} 
        <div className="mt-2 flex flex-col">
          {categoryTitle && (
             <Text className="text-ui-fg-subtle text-sm" data-testid="product-category">
               {categoryTitle}
             </Text>
          )}
          <Heading level="h3" className="text-[#333333] text-xl font-normal leading-tight mt-1" data-testid="product-title">
            {product.title}
          </Heading>
          <div className="mt-2 flex justify-between items-center">
            {/* --- Отображаем кнопку или статус "Нет в наличии" --- */}
            {isInStock ? (
              <Button 
                variant="secondary"
                className="!bg-black !text-white !p-2.5 !min-h-0 !h-auto !rounded-md hover:!bg-gray-800 transition-colors flex items-center justify-center"
                onClick={handleAddToCartClick}
                data-testid="product-add-to-cart-button"
              >
                <Image 
                  src="/images/cartIcon.svg" 
                  alt="В корзину" 
                  width={24} 
                  height={24}
                  className="brightness-0 invert"
                />
              </Button>
            ) : (
              <Text className="text-sm text-ui-fg-muted" data-testid="product-out-of-stock">
                Нет в наличии
              </Text>
            )}
            {/* Цена (отображается всегда, если есть) */} 
            {cheapestPrice && <ProductPrice product={product} region={region} />}
          </div>
        </div>
      </div>
    // </ProductProvider>
  )
}
