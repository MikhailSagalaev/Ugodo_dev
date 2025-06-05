"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { addToCart } from "@lib/data/cart"
import { useParams } from "next/navigation"
import CartNotification from "@modules/common/components/cart-notification"

type ProductCardProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  isFeatured?: boolean
  categoryTitle?: string
  textAlign?: "left" | "center" | "right"
  badgeType?: "new" | "hit" | "discount" | "none"
}

const COLORS = {
  mint: "#C2E7DA",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#7f7f7f"
}

export default function ProductCard({
  product,
  region,
  isFeatured,
  categoryTitle,
  textAlign = "center",
  badgeType = "none",
}: ProductCardProps) {
  const { cheapestPrice } = getProductPrice({
    product: product,
    region: region,
  });

  const isInStock = !!cheapestPrice;
  
  const [isWished, setIsWished] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
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
    
    if (!product.variants?.[0]) return;
    
    if (!isInStock) {
      // Логика предзаказа
      console.log('Предзаказ товара:', {
        variantId: product.variants[0].id,
        quantity: 1,
        product: product.title
      });
      // TODO: Здесь будет логика отправки предзаказа на сервер
      return;
    }
    
    setIsAddingToCart(true);
    try {
      await addToCart({
        variantId: product.variants[0].id,
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
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  
  const handleHeartMouseEnter = () => setIsHeartHovered(true);
  const handleHeartMouseLeave = () => setIsHeartHovered(false);

  const secondaryTitle = product.collection?.title || categoryTitle || "";

  const textAlignClass = textAlign === "right" ? "text-right" : textAlign === "center" ? "text-center" : "text-left";

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
        className="group relative bg-white transition-all duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <LocalizedClientLink href={`/products/${product.handle}`} className="block">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
            <Thumbnail
              thumbnail={product.thumbnail}
              images={product.images}
              size="full"
              isFeatured={isFeatured}
              className={`absolute inset-0 size-full object-cover transition-transform duration-300 ease-in-out ${isHovered ? 'scale-105' : ''}`}
            />

            <div className="absolute top-3 left-3 flex gap-1 z-10">
              {badgeType === "new" && (
                <div className="bg-[#BAFF29] text-black px-2 py-1 text-xs font-bold rounded-sm">
                  NEW
                </div>
              )}

              {badgeType === "hit" && (
                <div className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-sm">
                  HIT
                </div>
              )}

              {!isInStock && (
                <div className="text-white px-2 py-1 text-xs font-bold rounded-sm" style={{ backgroundColor: '#6290C3' }}>
                  ПРЕДЗАКАЗ
                </div>
              )}
            </div>

            {badgeType === "discount" && cheapestPrice?.price_type === 'sale' && cheapestPrice.percentage_diff && (
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
        </LocalizedClientLink>

        <div className={`p-3 ${textAlignClass}`}>
          <div className="space-y-1">
            {cheapestPrice && (
              <PreviewPrice 
                price={{
                  calculated_price: cheapestPrice.calculated_price || "0",
                  original_price: cheapestPrice.original_price || "0",
                  calculated_price_number: cheapestPrice.calculated_amount || 0,
                  original_price_number: cheapestPrice.original_amount || 0,
                  currency_code: cheapestPrice.currency_code || "RUB",
                  price_type: cheapestPrice.price_type || "default",
                  percentage_diff: cheapestPrice.percentage_diff?.toString() || "0"
                }}
              />
            )}
            
            {secondaryTitle && (
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {secondaryTitle}
              </p>
            )}
            
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
              {product.title}
            </h3>
          </div>
        </div>
      </div>
    </>
  )
} 