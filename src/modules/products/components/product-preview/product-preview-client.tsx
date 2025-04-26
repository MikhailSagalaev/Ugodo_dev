"use client";
import * as React from "react";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Thumbnail from "../thumbnail";
import { Heart, Play, ShoppingBag } from "lucide-react";
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

  return (
    <div className="self-stretch flex flex-col border border-gray-200 rounded-[4px] overflow-hidden group">
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="relative w-full aspect-square overflow-hidden">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
            className="object-cover absolute inset-0 size-full group-hover:scale-105 transition-transform duration-300 ease-in-out"
          />
          
          <div className="absolute top-0 left-0 p-2 w-full flex justify-between items-start z-10">
            {discountBadge && (
              <div className={`flex items-center justify-center text-xl font-semibold rounded-md px-2.5 py-1 min-h-[30px] ${discountBadge.color}`}>
                %
              </div>
            )}
            {!discountBadge && <div className="h-[30px]"/>}

            <button 
              className={`bg-[#07C4F5] ${!isLoadingCustomer && customer ? 'hover:bg-cyan-500' : 'opacity-50 cursor-not-allowed'} transition-colors h-10 w-10 rounded-md flex items-center justify-center relative`}
              onClick={handleWishlistToggle}
              disabled={isLoadingCustomer || !customer || isLoadingWishlist}
              aria-label={isInWishlist ? "Удалить из избранного" : "Добавить в избранное"}
              title={!customer ? "Войдите, чтобы добавить в избранное" : (isInWishlist ? "Удалить из избранного" : "Добавить в избранное")}
            >
              <Heart 
                className={`w-5 h-5 text-white transition-all ${isInWishlist ? 'fill-white' : ''}`}
              />
              {(isLoadingWishlist || isLoadingCustomer) && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                 </div>
              )}
            </button>
          </div>

          <div className="absolute bottom-0 left-0 p-2 w-full flex justify-between items-end z-10">
            {product.hasVideo && (
              <div className="bg-black/60 backdrop-blur-sm rounded-full h-10 w-10 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" fill="white" />
              </div>
            )}
            {!product.hasVideo && <div className="h-10"/>}

            <div className="bg-black/60 backdrop-blur-sm text-white text-xs text-right px-2.5 py-1 rounded-md">
              {product.deliveryInfo}
            </div>
          </div>

          {!product.isInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
              <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-md">
                <span className="text-white font-medium text-xl">Нет в наличии</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col gap-2">
          <div className="text-gray-600 text-base line-clamp-1">
            {product.category}
          </div>
          <div className="text-zinc-800 text-lg font-medium uppercase line-clamp-2 h-[3em] leading-tight">
            {product.title}
          </div>
        </div>
      </LocalizedClientLink>
      
      <div className="mt-auto p-4 flex justify-between items-center">
        <button
          className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${product.isInStock ? 'bg-black hover:bg-gray-700' : 'bg-gray-300 cursor-not-allowed'}`}
          aria-label="Добавить в корзину"
          disabled={!product.isInStock}
          onClick={(e) => {
            e.preventDefault();
            console.log("Add to cart clicked for:", product.id);
          }}
        >
          <ShoppingBag className="w-5 h-5 text-white" />
        </button>
        
        <div className="flex flex-col items-end text-black">
          {price ? (
            <div className="relative h-[2.5em]">
              {price.price_type === 'sale' && price.original_price && (
                <div className="absolute right-0 bottom-0 flex flex-col items-end">
                  <div className="text-sm text-gray-500 line-through">
                    {price.original_price}
                  </div>
                  <div className="text-lg font-semibold">
                    {price.calculated_price}
                  </div>
                  <div
                    className="absolute top-[calc(50%-8px)] right-0 h-[1px] w-[calc(100%+4px)] bg-[#07C4F5] transform -rotate-6 origin-right"
                  />
                </div>
              )}
              {price.price_type !== 'sale' && (
                <div className="absolute right-0 bottom-0">
                  <div className="text-lg font-semibold">
                    {price.calculated_price}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[2.5em]" />
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductPreviewCard; 