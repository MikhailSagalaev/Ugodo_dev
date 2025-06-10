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
  const [isCartHovered, setIsCartHovered] = useState(false);
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
  
  const handleCartMouseEnter = () => setIsCartHovered(true);
  const handleCartMouseLeave = () => setIsCartHovered(false);

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
    if (!product.variants?.length) return { currentPrice: 0, originalPrice: null, hasDiscount: false, pricePerUnit: null, hasQuantityDiscount: false, hasMultipleVariants: false };

    let minCurrentPrice = Infinity;
    let minOriginalPrice = null;
    let hasDiscount = false;
    let pricePerUnit = null;
    let hasQuantityDiscount = false;
    let hasMultipleVariants = false;

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

    hasMultipleVariants = product.variants && product.variants.length > 1;

    return {
      currentPrice: minCurrentPrice === Infinity ? 0 : minCurrentPrice,
      originalPrice: hasQuantityDiscount ? pricePerUnit : minOriginalPrice,
      hasDiscount: hasDiscount || hasQuantityDiscount,
      pricePerUnit,
      hasQuantityDiscount,
      hasMultipleVariants
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
        className={`group relative flex flex-col w-full product-card-styled`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ borderRadius: '12px' }}
      >
        
        <div className="block relative w-full overflow-hidden product-card-image" style={{ backgroundColor: '#fff', boxSizing: 'border-box', display: 'block', lineHeight: 0, margin: '0 auto', overflow: 'hidden', position: 'relative', width: '100%', zIndex: 3 }}>
          <div style={{ content: '', display: 'block', paddingTop: '133.24%' }}></div>
          <div style={{ alignContent: 'center', alignItems: 'center', bottom: 0, display: 'flex', justifyContent: 'center', overflow: 'hidden', right: 0, borderRadius: '12px', left: 0, position: 'absolute', top: 0 }}>
            <LocalizedClientLink href={`/products/${product?.handle}`} className="block w-full h-full">
              <div className="transition-transform duration-300 group-hover:scale-105 w-full h-full">
                <SmartImage
                  src={imageSrc}
                  alt={product.title || "Product image"}
                  sizes="(max-width: 640px) 225px, (max-width: 768px) 240px, (max-width: 1118px) 220px, (max-width: 1233px) 230px, 320px"
                  containerClassName="w-full h-full"
                  aspectRatio="contain"
                />
              </div>
            </LocalizedClientLink>
          </div>

          <div className="absolute top-0 left-0 flex gap-1 z-10">
          </div>

          <div style={{
            alignItems: 'start',
            bottom: '6px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            left: '6px',
            pointerEvents: 'none',
            position: 'absolute',
            right: '6px',
            width: '100%',
            zIndex: 5
          }}>
            <div style={{
              background: '#6290C3',
              display: 'flex',
              alignItems: 'center',
              gap: '0px',
              padding: '2px',
              borderRadius: '8px',
              width: '118px',
              height: '23px'
            }}>
              <img 
                src="/images/logo/logo2.png" 
                alt="Logo" 
                style={{ width: '30px', height: '30px' }}
              />
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: 0,
                lineHeight: '20px',
                color: 'white'
              }}>
                Выгодно
              </span>
            </div>
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
              fill={isWished ? '#f1117e' : (isHeartHovered ? 'white' : "none")} 
              stroke={isWished ? '#f1117e' : (isHeartHovered ? 'white' : '#9CA3AF')} 
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
                onMouseEnter={handleCartMouseEnter}
                onMouseLeave={handleCartMouseLeave}
                className={
                  isTabletOrMobile
                    ? `w-[35px] h-[35px] flex items-center justify-center transition-colors duration-200 rounded-full border border-transparent bg-gray-400`
                    : `w-11 h-11 flex items-center justify-center transition-colors duration-200 rounded-full ${isAddingToCart ? 'bg-gray-400' : 'bg-gray-400 hover:bg-gray-400'}`
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
                    stroke={isCartHovered ? "#BAFF29" : "white"} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    xmlns="http://www.w3.org/2000/svg"
                    className="transition-colors duration-200"
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

        <div className={`product-card-content-compact flex flex-col ${textAlignClass} w-full flex-1`} style={{ alignItems: 'flex-start', color: '#070707', display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100%' }}>
          
          {/* Цена сразу после фото с отступом 8px */}
          {priceInfo.currentPrice > 0 && (
            <LocalizedClientLink href={`/products/${product?.handle}`}>
              <div className={`product-price ${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 w-full cursor-pointer`} style={{ marginTop: '8px', marginBottom: '0px' }}>
                <div className={`flex items-baseline gap-2 ${textAlign === "right" ? "justify-end" : textAlign === "center" ? "justify-center" : ""}`}>
                  <span 
                    className={`font-bold transition-colors duration-200 uppercase hover:text-gray-400`}
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      letterSpacing: 0,
                      color: '#6290C3'
                    }}
                  >
                    {formatPrice(priceInfo.currentPrice)}₽
                  </span>
                  {priceInfo.hasDiscount && priceInfo.originalPrice && (
                    <>
                      <span 
                        className={`font-semibold transition-colors duration-200`}
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          letterSpacing: 0,
                          lineHeight: '20px',
                          color: '#99a3ae',
                          textDecoration: 'line-through'
                        }}
                      >
                        {formatPrice(priceInfo.originalPrice)}₽
                      </span>
                      <span 
                        style={{
                          color: '#f1117e',
                          fontSize: '14px',
                          fontWeight: 600,
                          letterSpacing: 0,
                          lineHeight: '20px'
                        }}
                      >
                        -{Math.round(((priceInfo.originalPrice - priceInfo.currentPrice) / priceInfo.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </LocalizedClientLink>
          )}
          
          {/* Название с отступом 4px от цены */}
          <LocalizedClientLink href={`/products/${product?.handle}`}>
            <h3 
              className={`product-title ${firstInRow && isTabletOrMobile ? 'pl-5' : 'px-2'} sm:px-3 leading-tight cursor-pointer hover:text-gray-400 transition-colors duration-200`}
              style={{
                fontSize: '16px',
                fontWeight: 400,
                letterSpacing: 0,
                lineHeight: '24px',
                color: '#070707',
                marginTop: '4px',
                marginBottom: '0px',
                paddingTop: '0px',
                paddingBottom: '0px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {product.title}
            </h3>
          </LocalizedClientLink>
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
