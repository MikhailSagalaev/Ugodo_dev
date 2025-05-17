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
  isFirstInMobileRow?: boolean
  isLeftSideInMobileGrid?: boolean
  isFirstInSlider?: boolean
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
  isFirstInMobileRow = false,
  isLeftSideInMobileGrid = false,
  isFirstInSlider = false,
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
  const [isHovered, setIsHovered] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)

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

  // Эффект для определения размера экрана
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.matchMedia("(min-width: 1024px)").matches)
    }
    checkScreenSize() // Первоначальная проверка
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize) // Очистка
  }, [])

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
    <div 
      className="flex flex-col md:mx-2 mx-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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
            className="absolute top-0 left-0 bg-[#baff29] text-black px-2 py-1 text-xs font-bold z-10 select-none"
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

      {/* Блок с ценой, категорией и названием - ВОССТАНОВЛЕН К ОРИГИНАЛЬНОЙ СТРУКТУРЕ */}
      <div className={clx(
        "mt-2 flex flex-col gap-1 pb-2 relative",
        { 
          "pl-5": (isLeftSideInMobileGrid && !isLargeScreen) || (isFirstInSlider && !isLargeScreen)
        },
        isFirstInMobileRow ? "sm:ml-0" : "",
        "sm:px-2"
      )}>
        {/* ОПЦИИ ТОВАРА - ПЕРВЫЙ ЭЛЕМЕНТ */}
        <div className="md:hidden mb-1 flex flex-wrap gap-1 order-1">
          {product.options?.map((option) => 
            option.values && option.values.length > 0 && (
              <div key={option.id} className="text-xs text-gray-500">
                {option.values.slice(0, 3).map((value, idx) => (
                  <span key={value.value} className="inline-block bg-gray-100 px-1.5 py-0.5 rounded mr-1 mb-1">
                    {value.value}
                  </span>
                ))}
                {option.values.length > 3 && <span>+{option.values.length - 3}</span>}
              </div>
            )
          )}
        </div>
        
        {/* КАТЕГОРИЯ - ВТОРОЙ ЭЛЕМЕНТ */}
        <div className="text-sm text-zinc-500 truncate order-2">{categoryTitle || product.collection?.title || product.type?.value}</div>
        
        {/* НАЗВАНИЕ - ТРЕТИЙ ЭЛЕМЕНТ */}
        <div className={`text-base font-medium leading-tight line-clamp-2 min-h-[2.5em] ${isHovered ? 'text-[#6290c3]' : 'text-zinc-800'} transition-colors order-3`}>
          {product.title}
        </div>
        
        {/* ЦЕНА И СТАРАЯ ЦЕНА - ЧЕТВЕРТЫЙ ЭЛЕМЕНТ */}
        {cheapestPrice && (
          <div className="flex items-end gap-2 mt-1 order-4">
            <span className="text-xl font-semibold text-black">{cheapestPrice.calculated_price}</span>
            {cheapestPrice.price_type === 'sale' && cheapestPrice.original_price && (
              <span className="text-base text-gray-400 line-through">{cheapestPrice.original_price}</span>
            )}
          </div>
        )}
        
        {/* КОРЗИНА - кнопка (ВОССТАНОВЛЕНА ОРИГИНАЛЬНАЯ КНОПКА) */}
        <Button
          onClick={handleAddToCartClick}
          isLoading={isAddingToCart}
          className="absolute right-2 bottom-[7rem] md:bottom-4 w-10 h-10 bg-[#1A1341] text-white rounded-md flex items-center justify-center hover:bg-[#2d1f6e] transition-colors z-10 p-0"
          aria-label="Добавить в корзину"
        >
          {!isAddingToCart && <Image alt="В корзину" loading="lazy" width="20" height="20" decoding="async" data-nimg="1" style={{color: 'transparent'}} src="/images/cartIcon.svg" />}
        </Button>
      </div>
      
      {/* Модальное окно для выбора опций (ВОССТАНОВЛЕНО К ОРИГИНАЛЬНОЙ ЛОГИКЕ) */}
      {isModalOpen && (
        <Modal 
          isOpen={isModalOpen} 
          close={() => setIsModalOpen(false)}
          size="small"
        >
          <Modal.Title>
            <div className="mb-4 text-xl font-semibold">Выберите опции</div>
          </Modal.Title>
          <ProductActions product={product} region={region} />
        </Modal>
      )}
    </div>
  )
}
