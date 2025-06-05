"use client";

import React, { useState, useEffect } from "react";
import { HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getProductPrice } from "@lib/util/get-product-price";
import Image from "next/image";
import Thumbnail from "../thumbnail";
import PreviewPrice from "./price";
import { addToCart } from "@lib/data/cart";
import { useParams } from "next/navigation";
import CartNotification from "@modules/common/components/cart-notification";
import ProductVariantModal from "@modules/common/components/product-variant-modal";

const COLORS = {
  mint: "#C2E7DA",
  darkBlue: "#1A1341",
  blue: "#6290C3",
  cream: "#F1FFE2",
  neonGreen: "#BAFF29"
}

const PLACEHOLDER_IMAGE = "/images/placeholder.png";

type ProductPreviewProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  isFeatured?: boolean;
  categoryTitle?: string;
  showVideoIcon?: (product: HttpTypes.StoreProduct) => boolean;
  showTimeLabel?: (product: HttpTypes.StoreProduct) => boolean;
  timeLabelPlaceholder?: React.ReactNode;
  videoIconPlaceholder?: string;
  textAlign?: "left" | "right" | "center";
  badgeType?: "new" | "hit" | "discount" | "none";
  firstInRow?: boolean;
};

export default function ProductPreview({
  product,
  region,
  isFeatured,
  categoryTitle,
  showVideoIcon = () => false,
  showTimeLabel = () => false,
  timeLabelPlaceholder = "В течение часа",
  videoIconPlaceholder = "/images/video-icon.svg",
  textAlign = "center",
  badgeType = "none",
  firstInRow = false,
}: ProductPreviewProps) {
  const { cheapestPrice } = getProductPrice({
    product: product,
    region: region,
  });

  // Проверяем реальное наличие товара
  const checkProductAvailability = () => {
    if (!product.variants || product.variants.length === 0) return false;
    
    // Если есть только один вариант
    if (product.variants.length === 1) {
      const variant = product.variants[0];
      return (variant.inventory_quantity || 0) > 0;
    }
    
    // Если есть несколько вариантов, проверяем есть ли хотя бы один в наличии
    return product.variants.some(variant => (variant.inventory_quantity || 0) > 0);
  };

  const isInStock = checkProductAvailability();
  
  const [isWished, setIsWished] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isTabletOrMobile, setIsTabletOrMobile] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);

  const params = useParams();

  useEffect(() => {
    const handleResize = () => {
      setIsTabletOrMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWished(!isWished);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Если товара нет в наличии, открываем модалку для предзаказа
    if (!isInStock) {
      setIsModalOpen(true);
      return;
    }
    
    // Если есть только один вариант и он в наличии
    if (product.variants?.length === 1) {
      const variant = product.variants[0];
      if ((variant.inventory_quantity || 0) > 0) {
        setIsAddingToCart(true);
        try {
          await addToCart({
            variantId: variant.id,
            quantity: 1,
            countryCode: params.countryCode as string,
          });
          
          window.dispatchEvent(new CustomEvent('cartUpdated'));
          setShowCartNotification(true);
        } catch (error) {
          console.error("Ошибка добавления в корзину:", error);
        } finally {
          setIsAddingToCart(false);
        }
      }
      return;
    }
    
    // Если есть несколько вариантов, открываем модалку
    if ((product.variants?.length ?? 0) > 1) {
      setIsModalOpen(true);
      return;
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  const handleHeartMouseEnter = () => setIsHeartHovered(true);
  const handleHeartMouseLeave = () => setIsHeartHovered(false);

  // Получаем реальный тип из базы данных
  const productType = product.type?.value || product.collection?.title || categoryTitle || "";

  // Цветовые варианты для отображения
  const colorOptions = product.options?.find(option => 
    option.title.toLowerCase().includes('цвет') || 
    option.title.toLowerCase().includes('color')
  );

  // Получаем уникальные цвета из вариантов
  const colors: string[] = []
  if (colorOptions) {
    const colorSet = new Set<string>()
    product.variants?.forEach(variant => {
      variant.options?.forEach(optionValue => {
        if (optionValue.option_id === colorOptions.id) {
          colorSet.add(optionValue.value)
        }
      })
    })
    colors.push(...Array.from(colorSet))
  }

  const hasColors = colors.length > 0;

  // Функция для преобразования названия цвета в CSS цвет
  const getColorValue = (colorName: string): string => {
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(colorName)) {
      return colorName;
    }
    
    if (/^rgba?\(/.test(colorName)) {
      return colorName;
    }
    
    const colorMap: {[key: string]: string} = {
      'черный': '#000000',
      'белый': '#FFFFFF',
      'красный': '#FF0000',
      'зеленый': '#008000',
      'синий': '#0000FF',
      'желтый': '#FFFF00',
      'оранжевый': '#FFA500',
      'фиолетовый': '#800080',
      'розовый': '#FFC0CB',
      'серый': '#808080',
      'коричневый': '#A52A2A',
      'голубой': '#00BFFF',
      
      'black': '#000000',
      'white': '#FFFFFF',
      'red': '#FF0000',
      'green': '#008000',
      'yellow': '#FFFF00',
      'orange': '#FFA500',
      'purple': '#800080',
      'pink': '#FFC0CB',
      'gray': '#808080',
      'grey': '#808080',
      'brown': '#A52A2A',
      'cyan': '#00FFFF',
      
      ...COLORS
    };
    
    const lowerColorName = colorName.toLowerCase();
    return colorMap[lowerColorName] || colorName;
  };

  const textAlignClass = textAlign === "right" ? "text-right" : textAlign === "center" ? "text-center" : "text-left";

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const shouldShowPlaceholder = !product.thumbnail || imageError;
  const imageSrc = shouldShowPlaceholder ? PLACEHOLDER_IMAGE : (product.thumbnail as string);

  return (
    <>
      {/* Уведомление о добавлении в корзину */}
      <CartNotification
        product={product}
        variant={product.variants?.[0]}
        quantity={1}
        isVisible={showCartNotification}
        onClose={() => setShowCartNotification(false)}
      />

      <div 
        className={`group relative flex flex-col w-full sm:max-w-none max-w-[225px] ${isTabletOrMobile ? 'pb-6' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        <div className="block relative w-full overflow-hidden bg-white">
          <LocalizedClientLink href={`/products/${product?.handle}`} className="block">
            <div className="relative w-full aspect-[3/4] transition-transform duration-300 group-hover:scale-105">
              <Image
                src={imageSrc}
                alt={product.title || "Product image"}
                fill
                sizes="(max-width: 640px) 225px, (max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
                className="object-cover"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            </div>
          </LocalizedClientLink>

          <div className="absolute top-3 left-3 flex gap-1 z-10">
            {badgeType === "new" && (
              <div className="bg-[#BAFF29] text-black text-xs font-bold px-2 py-1 uppercase rounded-sm">
                NEW
              </div>
            )}

            {badgeType === "hit" && (
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 uppercase rounded-sm">
                HIT
              </div>
            )}

            {!isInStock && (
              <div className="text-white text-xs font-bold px-2 py-1 uppercase rounded-sm" style={{ backgroundColor: '#6290C3' }}>
                ПРЕДЗАКАЗ
              </div>
            )}
          </div>

          {badgeType === "discount" && cheapestPrice?.percentage_diff && (
            <div className="absolute top-3 left-3 bg-[#FF3998] text-white px-2 py-1 text-xs font-bold z-10 rounded-sm">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}

          {badgeType === "none" && cheapestPrice?.price_type === 'sale' && cheapestPrice.percentage_diff && (
            <div className="absolute top-3 left-3 bg-[#FF3998] text-white px-2 py-1 text-xs font-bold z-10 rounded-sm">
              -{cheapestPrice.percentage_diff}%
            </div>
          )}

          <button
            onClick={toggleWishlist}
            onMouseEnter={handleHeartMouseEnter}
            onMouseLeave={handleHeartMouseLeave}
            className="absolute top-3 right-3 z-10 flex items-center justify-center p-0 border-0 bg-transparent"
            aria-label={isWished ? "Удалить из избранного" : "Добавить в избранное"}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill={isWished || isHeartHovered ? COLORS.mint : "none"} 
              stroke={isHeartHovered ? COLORS.mint : COLORS.mint} 
              strokeWidth="2"
              className="transition-all duration-200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {(isTabletOrMobile || isHovered) && (
            <div className={isTabletOrMobile ? "absolute right-3 bottom-3 z-10" : "absolute bottom-5 right-5 z-10"}>
              <button
                onClick={handleAddToCart}
                className={
                  isTabletOrMobile
                    ? `w-[35px] h-[35px] flex items-center justify-center transition-colors duration-200 rounded-md border border-transparent ${!isInStock ? '' : 'bg-[#1A1341]'}`
                    : `w-11 h-11 flex items-center justify-center transition-colors duration-200 rounded-md ${!isInStock ? '' : isAddingToCart ? 'bg-[#C2E7DA]' : 'bg-[#1A1341] hover:bg-[#C2E7DA]'}`
                }
                style={!isInStock ? { backgroundColor: '#6290C3' } : {}}
                aria-label={!isInStock ? "Сделать предзаказ" : "Добавить в корзину"}
                disabled={isAddingToCart}
              >
                {isAddingToCart ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg 
                    width="20"
                    height="20"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>

        {hasColors && (
          <div className="flex flex-nowrap overflow-x-auto py-1 mt-2 px-2 justify-end w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
            {colors.slice(0, 3).map((color, idx) => {
              const colorValue = getColorValue(color);
              return (
                <div
                  key={idx}
                  className="w-4 sm:w-5 h-4 sm:h-5 rounded-full border border-gray-300 flex-shrink-0 shadow-sm mr-1.5"
                  style={{
                    backgroundColor: colorValue,
                    boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)"
                  }}
                  title={color}
                />
              );
            })}
            {colors.length > 3 && (
              <div className="text-xs text-gray-500 flex items-center font-medium">
                +{colors.length - 3}
              </div>
            )}
          </div>
        )}

        <div className={`pt-2 pb-2 flex flex-col ${textAlignClass} w-full`}>
          
          {/* Кликабельная категория/тип */}
          {productType && (
            <LocalizedClientLink href={`/products/${product?.handle}`}>
              <div className={`text-[11px] sm:text-[11px] font-medium ${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 mb-1 ${isHovered ? 'text-[#C2E7DA]' : 'text-black'} transition-colors duration-200 uppercase sm:leading-normal leading-tight cursor-pointer hover:text-[#C2E7DA]`}>
                {productType}
              </div>
            </LocalizedClientLink>
          )}
          
          {/* Кликабельное название */}
          <LocalizedClientLink href={`/products/${product?.handle}`}>
            <h3 className={`text-base sm:text-[20px] font-medium ${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 leading-tight line-clamp-2 mb-1 ${isHovered ? 'text-[#C2E7DA]' : 'text-black'} transition-colors duration-200 uppercase cursor-pointer hover:text-[#C2E7DA]`}>
              {product.title}
            </h3>
          </LocalizedClientLink>
          
          {/* Подзаголовок */}
          {product.subtitle && (
            <LocalizedClientLink href={`/products/${product?.handle}`}>
              <div className={`text-[18px] font-medium ${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 mb-2 ${isHovered ? 'text-[#C2E7DA]' : 'text-gray-500'} transition-colors duration-200 lowercase cursor-pointer hover:text-[#C2E7DA]`}>
                {product.subtitle}
              </div>
            </LocalizedClientLink>
          )}
          
          {/* Кликабельная цена */}
          {cheapestPrice && (
            <LocalizedClientLink href={`/products/${product?.handle}`}>
              <div className={`${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 w-full cursor-pointer`}>
                <div className={`flex items-baseline gap-2 ${textAlign === "right" ? "justify-end" : textAlign === "center" ? "justify-center" : ""}`}>
                  <span className={`text-base sm:text-[20px] font-bold ${isHovered ? 'text-[#C2E7DA]' : 'text-black'} transition-colors duration-200 uppercase hover:text-[#C2E7DA]`}>
                    {cheapestPrice.calculated_price}
                  </span>
                  {cheapestPrice.price_type === 'sale' && cheapestPrice.original_price && (
                    <span className="text-sm text-gray-400 line-through uppercase">
                      {cheapestPrice.original_price}
                    </span>
                  )}
                </div>
              </div>
            </LocalizedClientLink>
          )}
        </div>

        {/* Модалка выбора вариантов */}
        <ProductVariantModal
          product={product}
          region={region}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          onAddToCartSuccess={() => {
            setShowCartNotification(true);
          }}
        />
      </div>
    </>
  );
}
