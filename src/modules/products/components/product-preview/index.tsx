"use client";

import React, { useState, useEffect } from "react";
import { HttpTypes } from "@medusajs/types";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { getProductPrice } from "@lib/util/get-product-price";
import { getCheapestPricePerUnit } from "@lib/util/get-cheapest-per-unit-price";
import Image from "next/image";
import Thumbnail from "../thumbnail";
import PreviewPrice from "./price";
import { addToCart } from "@lib/data/cart";
import { useParams } from "next/navigation";
import CartNotification from "@modules/common/components/cart-notification";
import ProductVariantModal from "@modules/common/components/product-variant-modal";
import SmartImage from "@modules/common/components/smart-image";

const COLORS = {
  mint: "gray-400",
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
  const minPricePerUnit = getCheapestPricePerUnit(product);
  
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: region.currency_code?.toUpperCase() || 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/[^\d\s]/g, '')
  }

  const getDiscountPercentage = () => {
    if (!product.variants?.length) return 0;
    
    let maxDiscount = 0;
    
    for (const variant of product.variants) {
      const calculatedPrice = variant.calculated_price;
      if (calculatedPrice && 
          typeof calculatedPrice.calculated_amount === 'number' && 
          typeof calculatedPrice.original_amount === 'number' &&
          calculatedPrice.original_amount > calculatedPrice.calculated_amount) {
        
        const discount = Math.round(((calculatedPrice.original_amount - calculatedPrice.calculated_amount) / calculatedPrice.original_amount) * 100);
        if (discount > maxDiscount) {
          maxDiscount = discount;
        }
      }
    }
    
    return maxDiscount;
  }

  const discountPercentage = getDiscountPercentage();

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
  const [isTablet, setIsTablet] = useState(false);
  const [isMidTablet, setIsMidTablet] = useState(false);
  const [showCartNotification, setShowCartNotification] = useState(false);

  const params = useParams();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTabletOrMobile(width < 768);
      setIsTablet(width >= 768 && width < 1118);
      setIsMidTablet(width >= 1118 && width < 1233);
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

  const textAlignClass = textAlign === "right" ? "text-right" : textAlign === "center" ? "text-center" : "text-left";

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const shouldShowPlaceholder = !product.thumbnail || imageError;
  const imageSrc = shouldShowPlaceholder ? PLACEHOLDER_IMAGE : (product.thumbnail as string);

  // Получаем информацию о ценах с учетом скидок
  const getPriceInfo = () => {
    if (!product.variants?.length) return { currentPrice: 0, originalPrice: null, hasDiscount: false, pricePerUnit: null, hasQuantityDiscount: false };

    let minCurrentPrice = Infinity;
    let minOriginalPrice = null;
    let hasDiscount = false;
    let pricePerUnit = null;
    let hasQuantityDiscount = false;

    const quantityOption = product.options?.find(option => 
      option.title?.toLowerCase().includes('количество')
    );

    // Если есть опция количества, проверяем выгоду
    if (quantityOption) {
      // Находим цену за 1 штуку
      const singleUnitVariant = product.variants.find(v => 
        v.options?.some(opt => 
          opt.option_id === quantityOption.id && opt.value === "1"
        )
      );
      
      if (singleUnitVariant?.calculated_price?.calculated_amount) {
        const singleUnitPrice = singleUnitVariant.calculated_price.calculated_amount;
        
        // Находим самый выгодный вариант
        for (const variant of product.variants) {
          const calculatedPrice = variant.calculated_price;
          if (calculatedPrice && typeof calculatedPrice.calculated_amount === 'number') {
            let quantity = 1;
            
            const quantityValue = variant.options?.find(opt => opt.option_id === quantityOption.id)?.value;
            if (quantityValue) {
              quantity = parseInt(quantityValue) || 1;
            }
            
            const pricePerUnitForVariant = calculatedPrice.calculated_amount / quantity;
            
            if (pricePerUnitForVariant < minCurrentPrice) {
              minCurrentPrice = pricePerUnitForVariant;
              
              // Если цена за единицу меньше цены при покупке по 1 шт, есть выгода
              if (pricePerUnitForVariant < singleUnitPrice) {
                hasQuantityDiscount = true;
                pricePerUnit = singleUnitPrice; // Цена за 1 шт как "старая цена"
              }
            }
          }
        }
      }
    }

    // Обычная логика для товаров без опции количества или если нет выгоды
    if (!hasQuantityDiscount) {
      for (const variant of product.variants) {
        const calculatedPrice = variant.calculated_price;
        if (calculatedPrice && typeof calculatedPrice.calculated_amount === 'number') {
          if (calculatedPrice.calculated_amount < minCurrentPrice) {
            minCurrentPrice = calculatedPrice.calculated_amount;
            
            // Проверяем обычную скидку
            if (calculatedPrice.original_amount && calculatedPrice.original_amount > calculatedPrice.calculated_amount) {
              hasDiscount = true;
              minOriginalPrice = calculatedPrice.original_amount;
            }
          }
        }
      }
    }

    return {
      currentPrice: minCurrentPrice === Infinity ? 0 : minCurrentPrice,
      originalPrice: hasQuantityDiscount ? pricePerUnit : minOriginalPrice,
      hasDiscount: hasDiscount || hasQuantityDiscount,
      pricePerUnit,
      hasQuantityDiscount
    };
  };

  const priceInfo = getPriceInfo();

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
        className={`group relative flex flex-col w-full ${isTabletOrMobile ? 'max-w-[225px] pb-6' : isMidTablet ? 'max-w-[230px]' : 'sm:max-w-none'}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        
        <div className="block relative w-full overflow-hidden bg-white">
          <LocalizedClientLink href={`/products/${product?.handle}`} className="block">
            <div className="transition-transform duration-300 group-hover:scale-105">
              <SmartImage
                src={imageSrc}
                alt={product.title || "Product image"}
                sizes="(max-width: 640px) 225px, (max-width: 768px) 240px, (max-width: 1118px) 220px, (max-width: 1233px) 230px, 320px"
                containerClassName="w-full aspect-[3/4]"
                aspectRatio="3/4"
              />
            </div>
          </LocalizedClientLink>

          <div className="absolute top-0 left-0 flex gap-1 z-10">
            {isInStock && badgeType === "new" && (
              <div className="bg-[#BAFF29] text-black text-xs font-bold w-8 h-8 flex items-center justify-center uppercase">
                NEW
              </div>
            )}

            {isInStock && badgeType === "hit" && (
              <div className="text-white text-xs font-bold w-8 h-8 flex items-center justify-center uppercase" style={{ backgroundColor: 'rgb(255, 22, 134)' }}>
                HIT
              </div>
            )}
          </div>



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
              fill={isWished || isHeartHovered ? (isHovered ? '#9CA3AF' : COLORS.mint) : "none"} 
              stroke={isHeartHovered ? (isHovered ? '#9CA3AF' : COLORS.mint) : (isHovered ? '#9CA3AF' : '#9CA3AF')} 
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
                    ? `w-[35px] h-[35px] flex items-center justify-center transition-colors duration-200 rounded-md border border-transparent bg-[#1A1341]`
                    : `w-11 h-11 flex items-center justify-center transition-colors duration-200 rounded-md ${isAddingToCart ? 'bg-gray-400' : 'bg-[#1A1341] hover:bg-gray-400'}`
                }
                style={{}}
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

        <div className={`pt-2 pb-2 flex flex-col ${textAlignClass} w-full`}>
          
          {/* Плашки между фото и типом */}
          <div className="flex gap-1 mb-2">
            {!isInStock && badgeType !== "new" && badgeType !== "hit" && (
              <div 
                className="text-black bg-[#BAFF29] flex items-center justify-center uppercase"
                style={{ 
                  width: "90px",
                  height: "26px",
                  clipPath: 'polygon(0% 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 0% 100%, 8px 50%)',
                  fontSize: "11px",
                  fontWeight: 500,
                  lineHeight: "12.1px"
                }}
              >
                ПРЕДЗАКАЗ
              </div>
            )}

            {isInStock && badgeType === "discount" && (
              <div className="bg-[#FF3998] text-white px-2 py-1 text-xs font-bold">
                СКИДКА
              </div>
            )}
          </div>
          
          {/* Кликабельная категория/тип с отступом 17px */}
          {productType && (
            <LocalizedClientLink href={`/products/${product?.handle}`}>
              <div 
                className={`font-medium ${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 ${isHovered ? 'text-gray-400' : 'text-black'} transition-colors duration-200 uppercase sm:leading-normal leading-tight cursor-pointer hover:text-gray-400`}
                style={{
                  fontSize: isTablet || isMidTablet ? '9px' : '11px',
                  marginTop: '17px'
                }}
              >
                {productType}
              </div>
            </LocalizedClientLink>
          )}
          
          {/* Кликабельное название с отступом 10px */}
          <LocalizedClientLink href={`/products/${product?.handle}`}>
            <h3 
              className={`font-medium ${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 leading-tight ${isHovered ? 'text-gray-400' : 'text-black'} transition-colors duration-200 uppercase cursor-pointer hover:text-gray-400`}
              style={{
                fontSize: '18px',
                marginTop: '10px'
              }}
            >
              {product.title}
            </h3>
          </LocalizedClientLink>
          
          {/* Кликабельная цена с отступом 10px и старой ценой */}
          {priceInfo.currentPrice > 0 && (
            <LocalizedClientLink href={`/products/${product?.handle}`}>
              <div className={`${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 w-full cursor-pointer`} style={{ marginTop: '10px' }}>
                <div className={`flex items-baseline gap-2 ${textAlign === "right" ? "justify-end" : textAlign === "center" ? "justify-center" : ""}`}>
                  <span 
                    className={`font-medium ${isHovered ? 'text-gray-400' : 'text-black'} transition-colors duration-200 uppercase hover:text-gray-400`}
                    style={{
                      fontSize: isTablet || isMidTablet || isTabletOrMobile ? '16px' : '20px'
                    }}
                  >
                    {formatPrice(priceInfo.currentPrice)} ₽
                  </span>
                  {priceInfo.hasDiscount && priceInfo.originalPrice && (
                    <span 
                      className={`font-medium line-through-blue transition-colors duration-200 ${isHovered ? 'text-gray-400' : 'text-gray-400'} hover:text-gray-400`}
                      style={{
                        fontSize: isTablet || isMidTablet || isTabletOrMobile ? '16px' : '20px'
                      }}
                    >
                      {formatPrice(priceInfo.originalPrice)} ₽
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
