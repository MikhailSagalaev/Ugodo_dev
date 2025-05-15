"use client";

import React from "react"
import { HttpTypes } from "@medusajs/types"
// import { Region } from "@medusajs/medusa" // Не используется
import { Heading, Text, clx, Button, toast } from "@medusajs/ui"
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
import { getWishlist, addToWishlist, removeFromWishlist, retrieveCustomer } from "@lib/data/customer"
import { useEffect, useState } from "react"
import Modal from "@modules/common/components/modal"
import dynamic from "next/dynamic"
const ProductActions = dynamic(() => import("../product-actions"), { ssr: false })

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

  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistItemId, setWishlistItemId] = useState<string | null>(null);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    setIsLoadingCustomer(true);
    retrieveCustomer()
      .then(setCustomer)
      .catch(() => setCustomer(null))
      .finally(() => setIsLoadingCustomer(false));
  }, []);

  useEffect(() => {
    if (customer && !isLoadingCustomer) {
      setIsLoadingWishlist(true);
      getWishlist()
        .then(items => {
          const item = items.find(i => i.product_id === product.id);
          if (item) {
            setIsInWishlist(true);
            setWishlistItemId(item.id);
          } else {
            setIsInWishlist(false);
            setWishlistItemId(null);
          }
        })
        .catch(() => {
          setIsInWishlist(false);
          setWishlistItemId(null);
        })
        .finally(() => setIsLoadingWishlist(false));
    } else if (!customer && !isLoadingCustomer) {
      setIsInWishlist(false);
      setWishlistItemId(null);
    }
  }, [customer, product.id, isLoadingCustomer]);

  const handleWishlistClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!customer) {
      // Можно показать всплывашку или редирект на логин
      return;
    }
    setIsLoadingWishlist(true);
    let success = false;
    if (isInWishlist && wishlistItemId) {
      success = await removeFromWishlist(wishlistItemId);
      if (success) {
        setIsInWishlist(false);
        setWishlistItemId(null);
      }
    } else {
      success = await addToWishlist(product.id);
      if (success) {
        getWishlist().then(items => {
          const item = items.find(i => i.product_id === product.id);
          if (item) {
            setIsInWishlist(true);
            setWishlistItemId(item.id);
          }
        });
      }
    }
    setIsLoadingWishlist(false);
  };

  const handleAddToCartClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if ((product.variants?.length ?? 0) > 1) {
      setIsModalOpen(true)
      return
    }
    // Один вариант — добавляем сразу
    if (product.variants?.[0]) {
      setIsAddingToCart(true)
      try {
        const { addToCart } = await import("@lib/data/cart")
        await addToCart({
          variantId: product.variants[0].id,
          quantity: 1,
          countryCode: region.currency_code,
        })
        toast.success("Товар добавлен в корзину")
        setIsModalOpen(false)
      } finally {
        setIsAddingToCart(false)
      }
    }
  }

  return (
    <div className="flex flex-col">
      {/* Контейнер с изображением и оверлеями */}
      <LocalizedClientLink
        href={`/products/${product?.handle}`}
        className="group block relative w-full overflow-hidden aspect-[3/4]"
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
            className="absolute inset-0 size-full"
            data-testid="product-thumbnail"
          />
        ) : (
          <div className="absolute inset-0 size-full bg-gray-100 flex items-center justify-center">
             <span className="text-gray-500 text-xs">No image</span>
          </div>
        )}

        {/* СКИДКА */}
        {cheapestPrice?.price_type === 'sale' && cheapestPrice.percentage_diff && (
          <div
            className="absolute top-4 left-4 bg-[#CBF401] text-black px-2 py-1 text-xs font-bold z-10 select-none"
            aria-label={`Discount: ${cheapestPrice.percentage_diff}%`}
            data-testid="product-discount-badge"
          >
            -{cheapestPrice.percentage_diff}%
          </div>
        )}
        {/* ИЗБРАННОЕ */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-10 p-0 bg-transparent hover:bg-transparent focus:bg-transparent border-none shadow-none flex items-center justify-center"
          aria-label="Add to wishlist"
          data-testid="product-wishlist-button"
          style={{ pointerEvents: 'auto' }}
        >
          {isLoadingWishlist || isLoadingCustomer ? (
            <div className="w-5 h-5 animate-spin border-2 border-blue-400 border-t-transparent rounded-full" />
          ) : (
            <Image
              src={isInWishlist ? "/images/blueheart-filled.svg" : "/images/blueheart.svg"}
              alt="В избранное"
              width={20}
              height={20}
            />
          )}
        </button>
        {/* Нет в наличии */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-md">
              <span className="text-white font-medium text-lg sm:text-xl">Нет в наличии</span>
            </div>
          </div>
        )}
      </LocalizedClientLink>

      {/* Блок с ценой, категорией и названием */}
      <div className="mt-2 flex flex-col gap-1 px-2 pb-2 relative">
        {/* ЦЕНА и СТАРАЯ ЦЕНА */}
        {cheapestPrice && (
          <div className="flex items-end gap-2">
            <span className="text-xl font-semibold text-black">{cheapestPrice.calculated_price}</span>
            {cheapestPrice.price_type === 'sale' && cheapestPrice.original_price && (
              <span className="text-base text-gray-400 line-through">{cheapestPrice.original_price}</span>
            )}
          </div>
        )}
        {/* КАТЕГОРИЯ */}
        <div className="text-sm text-zinc-500 truncate">{categoryTitle || product.collection?.title || product.type?.value}</div>
        {/* НАЗВАНИЕ */}
        <div className="text-base font-medium text-zinc-800 leading-tight line-clamp-2 min-h-[2.5em]">{product.title}</div>
        {/* КОРЗИНА */}
        {isInStock && (
          <button
            className="absolute right-4 bottom-16 w-10 h-10 bg-black text-white rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors z-10"
            aria-label="Добавить в корзину"
            onClick={handleAddToCartClick}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Image
                src="/images/cartIcon.svg"
                alt="В корзину"
                width={20}
                height={20}
                className="brightness-0 invert"
              />
            )}
          </button>
        )}
      </div>
      {/* Модалка выбора варианта */}
      <Modal isOpen={isModalOpen} close={() => setIsModalOpen(false)} size="medium">
        <Modal.Title>Выберите вариант товара</Modal.Title>
        <Modal.Body>
          <ProductActions 
            product={product} 
            region={region} 
            onAddToCartSuccess={() => {
              toast.success("Товар добавлен в корзину")
              setIsModalOpen(false)
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  )
}
