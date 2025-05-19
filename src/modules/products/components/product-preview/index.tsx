"use client";

import React, { useState } from "react";
import { HttpTypes } from "@medusajs/types";
import { toast } from "@medusajs/ui";
import dynamic from "next/dynamic";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getProductPrice } from "@lib/util/get-product-price";
import Modal from "@modules/common/components/modal";
import Image from "next/image";

const ProductActions = dynamic(() => import("../product-actions"), { ssr: false });

// Colors from the palette
const COLORS = {
  mint: "#C2E7DA",
  darkBlue: "#1A1341",
  blue: "#6290C3",
  cream: "#F1FFEZ",
  neonGreen: "#BAFF29"
}

// Путь к заглушке
const PLACEHOLDER_IMAGE = "/images/placeholder-chair.png";

// Типы пропсов теперь включают регион
type ProductPreviewProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  isFeatured?: boolean;
  categoryTitle?: string;
  showVideoIcon?: (product: HttpTypes.StoreProduct) => boolean;
  showTimeLabel?: (product: HttpTypes.StoreProduct) => boolean;
  timeLabelPlaceholder?: React.ReactNode;
  videoIconPlaceholder?: string;
  // Для расположения текста (правый/левый)
  textAlign?: "left" | "right";
};

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
  videoIconPlaceholder = "/images/video-icon.svg",
  // По умолчанию текст слева
  textAlign = "left",
}: ProductPreviewProps) {
  // Get price information
  const { cheapestPrice } = getProductPrice({
    product: product,
    region: region,
  });

  // Check if in stock
  const isInStock = !!cheapestPrice;
  
  // UI state
  const [isWished, setIsWished] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Wishlist toggle (simplified)
  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWished(!isWished);
  };

  // Add to cart handler
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if ((product.variants?.length ?? 0) > 1) {
      setIsModalOpen(true);
      return;
    }
    
    if (product.variants?.[0]) {
      setIsAddingToCart(true);
      setTimeout(() => {
        toast.success("Товар добавлен в корзину");
        setIsAddingToCart(false);
      }, 800);
    }
  };

  // Handle mouse events for hover effects
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  // Heart hover effects
  const handleHeartMouseEnter = () => setIsHeartHovered(true);
  const handleHeartMouseLeave = () => setIsHeartHovered(false);

  // Get secondary title (collection or category)
  const secondaryTitle = product.collection?.title || categoryTitle || "";

  // Проверяем, является ли товар новинкой
  const isNew = product.created_at && new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Цветовые варианты для отображения
  const colorOptions = product.options?.find(option => 
    option.title.toLowerCase().includes('цвет') || 
    option.title.toLowerCase().includes('color')
  );

  // Получаем только реальные цвета из базы данных
  const colors = colorOptions?.values || [];
  const hasColors = colors.length > 0;

  // Текстовое выравнивание
  const textAlignClass = textAlign === "right" ? "text-right" : "text-left";

  // Обработчики для изображения
  const handleImageError = () => {
    console.warn(`Image failed to load: ${product.title || 'unnamed product'}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Определяем, какое изображение показывать
  const shouldShowPlaceholder = !product.thumbnail || imageError;
  const imageSrc = shouldShowPlaceholder ? PLACEHOLDER_IMAGE : (product.thumbnail as string);

  return (
    <div 
      className="group relative flex flex-col w-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ width: '320px' }}
    >
      {/* Image container */}
      <LocalizedClientLink
        href={`/products/${product?.handle}`}
        className="block relative w-full overflow-hidden bg-white aspect-square"
        style={{ width: '320px', height: '320px' }}
      >
        {/* Product image */}
        <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-105">
          <Image
            src={imageSrc}
            alt={product.title || "Product image"}
            fill
            sizes="(max-width: 640px) 160px, (max-width: 768px) 240px, (max-width: 1024px) 280px, 320px"
            className="object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>

        {/* NEW badge */}
        {isNew && (
          <div className="absolute top-3 left-3 bg-[#BAFF29] text-black text-xs font-bold px-2 py-1 uppercase z-10 rounded-sm">
            NEW
          </div>
        )}

        {/* Discount badge - показываем только если товар не новинка */}
        {!isNew && cheapestPrice?.price_type === 'sale' && cheapestPrice.percentage_diff && (
          <div className="absolute top-3 left-3 bg-[#FF3998] text-white px-2 py-1 text-xs font-bold z-10 rounded-sm">
            -{cheapestPrice.percentage_diff}%
          </div>
        )}

        {/* Wishlist heart button */}
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
            fill={isWished || isHeartHovered ? "#6290C3" : "none"} 
            stroke={isHeartHovered ? "#6290C3" : "#6290C3"} 
            strokeWidth={isHeartHovered ? "2" : "2"}
            className="transition-all duration-200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-black/70 px-4 py-2 rounded">
              <span className="text-white font-medium">Нет в наличии</span>
            </div>
          </div>
        )}

        {/* Add to cart button - показывается при наведении */}
        {isInStock && isHovered && (
          <div className="absolute bottom-3 right-3 z-10">
            <button
              onClick={handleAddToCart}
              className={`w-11 h-11 flex items-center justify-center transition-colors duration-200 ${
                isAddingToCart ? 'bg-[#6290C3]' : 'bg-black hover:bg-[#6290C3]'
              }`}
              aria-label="Добавить в корзину"
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
      </LocalizedClientLink>

      {/* Color options */}
      {hasColors && (
        <div className={`flex space-x-1 mt-2 ${textAlign === "right" ? "mr-3 justify-end" : "ml-3 justify-start"}`} style={{ width: '320px' }}>
          {colors.slice(0, 3).map((color, idx) => (
            <div 
              key={idx} 
              className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" 
              style={{ 
                backgroundColor: color.value 
              }}
              title={color.value}
            />
          ))}
          {colors.length > 3 && (
            <div className="text-xs text-gray-500 flex items-center">
              +{colors.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Product info - Обновленный порядок вывода со стилем Золотого Яблока */}
      <div className={`pt-2 pb-2 flex flex-col ${textAlignClass}`} style={{ width: '320px' }}>
        {/* Категория товара (первая строка) */}
        {secondaryTitle && (
          <div className={`text-[11px] px-3 mb-1 ${isHovered ? 'text-[#6290C3]' : 'text-black'} transition-colors duration-200 uppercase`}>
            {secondaryTitle}
          </div>
        )}
        
        {/* Название товара (вторая строка) - Увеличенный размер текста */}
        <h3 className={`text-[20px] font-medium px-3 leading-tight line-clamp-2 mb-2 ${isHovered ? 'text-[#6290C3]' : 'text-black'} transition-colors duration-200 uppercase`}>
          {product.title}
        </h3>
        
        {/* Цена (третья строка) */}
        {cheapestPrice && (
          <div className="px-3 w-full">
            <div className={`flex items-baseline gap-2 ${textAlign === "right" ? "justify-end" : ""}`}>
              <span className={`text-[20px] font-bold ${isHovered ? 'text-[#6290C3]' : 'text-black'} transition-colors duration-200 uppercase`}>
                {cheapestPrice.calculated_price}
              </span>
              {cheapestPrice.price_type === 'sale' && cheapestPrice.original_price && (
                <span className="text-sm text-gray-400 line-through uppercase">
                  {cheapestPrice.original_price}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Product variant selection modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} close={() => setIsModalOpen(false)}>
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Выберите вариант</h2>
            <ProductActions product={product} region={region} />
          </div>
        </Modal>
      )}
    </div>
  );
}
