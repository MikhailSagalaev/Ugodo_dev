"use client";
import * as React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Thumbnail from "../thumbnail";
import { Heart, Play, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { getWishlist, addToWishlist, removeFromWishlist, retrieveCustomer } from "@lib/data/customer";
import { HttpTypes } from "@medusajs/types";

// Типы для пропсов компонента
type Badge = {
  id: string;
  text: string;
  color: string;
};

type CheapestPrice = {
  calculated_price: string;
  original_price?: string;
  price_type: "sale" | "default";
  calculated_price_number: number;
  original_price_number?: number;
};

type ProductData = {
  id: string;
  handle: string;
  title: string;
  thumbnail: string | null;
  images: any[];
  hasVideo: boolean;
  category: string;
  badges: Badge[];
  isInStock: boolean;
  deliveryInfo: string;
  cheapestPrice: CheapestPrice | null;
};

type ProductPreviewCardProps = {
  product: ProductData;
  isFeatured?: boolean;
};

// Функция для рендеринга SVG (как в вашем примере)
const renderSvg = (svgHtml: string) => {
  return <div dangerouslySetInnerHTML={{ __html: svgHtml }} />;
};

function ProductPreviewCard({ product, isFeatured }: ProductPreviewCardProps) {
  const discountBadge = product.badges.find(b => b.id === 'discount');
  const price = product.cheapestPrice;
  const [customer, setCustomer] = React.useState<HttpTypes.StoreCustomer | null>(null);
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [wishlistItemId, setWishlistItemId] = React.useState<string | null>(null);
  const [isLoadingWishlist, setIsLoadingWishlist] = React.useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = React.useState(true);

  React.useEffect(() => {
    setIsLoadingCustomer(true);
    retrieveCustomer()
      .then(setCustomer)
      .catch(() => setCustomer(null))
      .finally(() => setIsLoadingCustomer(false));
  }, []);

  React.useEffect(() => {
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
        .catch(err => {
          console.error("Ошибка загрузки избранного в карточке товара:", err);
          setIsInWishlist(false);
          setWishlistItemId(null);
        })
        .finally(() => setIsLoadingWishlist(false));
    } else if (!customer && !isLoadingCustomer) {
        setIsInWishlist(false);
        setWishlistItemId(null);
    }
  }, [customer, product.id, isLoadingCustomer]);

  const handleWishlistToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!customer) {
      console.log("Пользователь не авторизован");
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
    if (!success) {
      console.error("Не удалось обновить избранное");
    }
  };

  // Пример SVG из вашего кода (адаптированы классы иконок)
  const discountIconSvg = `<div class="h-10 flex justify-center items-center text-xl font-bold text-black bg-yellow-400 rounded-none w-[60px]">%</div>`;
  const heartIconSvg = `<svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="transition-all ${isInWishlist ? 'fill-white' : 'fill-none'}"> <path d="M23.3486 10.5713C24.0278 10.5719 24.7011 10.6904 25.3389 10.9199L25.6104 11.0244C26.2373 11.2857 26.8137 11.6536 27.3145 12.1104L27.5244 12.3115L27.5254 12.3125C29.7957 14.5927 29.864 18.0998 27.7402 20.4414L27.5283 20.6641L19 29.1914L10.4727 20.6641L10.2598 20.4414C8.2045 18.175 8.20289 14.8167 10.2588 12.54L10.4717 12.3164L10.4727 12.3154C10.9515 11.8325 11.5095 11.4364 12.1221 11.1445L12.3877 11.0264C13.1049 10.7271 13.8743 10.5721 14.6514 10.5713C16.119 10.5709 17.5332 11.1226 18.6133 12.1162L19 12.4717L19.3877 12.1162C20.4676 11.1228 21.8813 10.5711 23.3486 10.5713Z" stroke="white" stroke-width="1.14286"></path> </svg>`;
  const videoIconSvg = `<svg width="24" height="24" viewBox="0 0 56 32" fill="none" xmlns="http://www.w3.org/2000/svg"> <path fill-rule="evenodd" clip-rule="evenodd" d="M26.0521 17.8317V6.16829L36.1538 12L26.0521 17.8317ZM36.692 11.1936L26.4809 5.29827C26.3394 5.21665 26.1788 5.17371 26.0154 5.17375C25.852 5.1738 25.6914 5.21683 25.5499 5.29853C25.4084 5.38022 25.2908 5.49771 25.209 5.6392C25.1273 5.78069 25.0841 5.9412 25.084 6.10462V17.8954C25.0831 18.0591 25.1258 18.22 25.2077 18.3617C25.2896 18.5035 25.4077 18.6208 25.55 18.7017C25.6911 18.7847 25.8518 18.8284 26.0155 18.8284C26.1791 18.8284 26.3398 18.7847 26.4809 18.7017L36.692 12.8064C36.834 12.725 36.9521 12.6076 37.0341 12.466C37.1162 12.3244 37.1595 12.1637 37.1595 12C37.1595 11.8363 37.1162 11.6756 37.0341 11.534C36.9521 11.3924 36.834 11.275 36.692 11.1936Z" fill="white"></path> </svg>`; // Упрощено для примера
  const cartIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M2.66699 8.5H21.3337L20.3595 19.2112C20.3068 19.7909 20.0393 20.33 19.6096 20.7226C19.1798 21.1153 18.6188 21.3331 18.0367 21.3333H5.96399C5.38187 21.3331 4.82086 21.1153 4.39109 20.7226C3.96132 20.33 3.69384 19.7909 3.64116 19.2112L2.66699 8.5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"></path> <path d="M7.33398 10.834V7.33402C7.33398 6.09635 7.82565 4.90936 8.70082 4.03419C9.57599 3.15902 10.763 2.66736 12.0007 2.66736C13.2383 2.66736 14.4253 3.15902 15.3005 4.03419C16.1757 4.90936 16.6673 6.09635 16.6673 7.33402V10.834" stroke="white" stroke-width="1.5" stroke-linecap="round"></path> </svg>`;

  return (
    <div className="flex flex-col gap-4 w-full group relative border border-transparent hover:border-gray-200 hover:shadow-md transition-all rounded-md overflow-hidden">
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
          />
          {/* СКИДКА */}
          {discountBadge && (
            <div className="absolute top-2 left-2 bg-[#CBF401] text-black px-2 py-1 text-xs font-bold z-10 select-none">
              -{discountBadge.text}
            </div>
          )}
          {/* ИЗБРАННОЕ */}
          <button
            className="absolute top-2 right-2 z-10 p-0 bg-transparent hover:bg-transparent focus:bg-transparent border-none shadow-none flex items-center justify-center"
            onClick={handleWishlistToggle}
            disabled={isLoadingCustomer || !customer || isLoadingWishlist}
            aria-label={isInWishlist ? "Удалить из избранного" : "Добавить в избранное"}
            title={!customer ? "Войдите, чтобы добавить в избранное" : (isInWishlist ? "Удалить из избранного" : "Добавить в избранное")}
            style={{ pointerEvents: 'auto' }}
          >
            {(isLoadingWishlist || isLoadingCustomer) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              </div>
            )}
            {!isLoadingWishlist && !isLoadingCustomer && renderSvg(heartIconSvg)}
          </button>
          {/* КОРЗИНА */}
          {product.isInStock && (
            <button
              className="absolute right-4 w-12 h-12 bg-black text-white rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors z-10"
              aria-label="Добавить в корзину"
              onClick={e => { e.preventDefault(); console.log('Add to cart clicked for product ID (client):', product.id); }}
              style={{ pointerEvents: 'auto', bottom: '6rem' }}
            >
              <Image
                src="/images/cartIcon.svg"
                alt="В корзину"
                width={24}
                height={24}
                className="brightness-0 invert"
              />
            </button>
          )}
          {/* Нет в наличии */}
          {!product.isInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-md">
                <span className="text-white font-medium text-lg sm:text-xl">Нет в наличии</span>
              </div>
            </div>
          )}
        </div>
        {/* Блок с ценой, категорией и названием */}
        <div className="flex flex-col gap-1 px-4 pt-2 pb-4">
          {/* ЦЕНА и СТАРАЯ ЦЕНА */}
          {price && (
            <div className="flex items-end gap-2">
              <span className="text-xl font-semibold text-black">{price.calculated_price}</span>
              {price.price_type === 'sale' && price.original_price && (
                <span className="text-base text-gray-400 line-through">{price.original_price}</span>
              )}
            </div>
          )}
          {/* КАТЕГОРИЯ */}
          <div className="text-sm text-zinc-500 truncate">{product.category}</div>
          {/* НАЗВАНИЕ */}
          <div className="text-base font-medium text-zinc-800 leading-tight line-clamp-2 min-h-[2.5em]">{product.title}</div>
        </div>
      </LocalizedClientLink>
    </div>
  );
}

export default ProductPreviewCard; 