'use client';

import { Text } from "@medusajs/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import Thumbnail from "../thumbnail";
import { ShoppingBag, Heart, Play } from "lucide-react";
import { useEffect } from "react";

// Типы для пропсов компонента
type Badge = {
  id: string;
  text: string;
  color: string;
};

type CheapestPrice = {
  calculated_price: string;
  original_price?: string;
  price_type: string;
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

type ProductPreviewClientProps = {
  product: ProductData;
  isFeatured?: boolean;
};

export default function ProductPreviewClient({ 
  product, 
  isFeatured 
}: ProductPreviewClientProps) {
  // Добавляем логирование для отладки
  useEffect(() => {
    console.log("Client | ProductPreviewClient | Product:", product.id, product.title);
    console.log("Client | ProductPreviewClient | Badges:", product.badges);
    console.log("Client | ProductPreviewClient | CheapestPrice:", product.cheapestPrice);
  }, [product]);

  return (
    <div className="flex flex-col rounded-[4px] overflow-hidden border border-gray-200">
      <LocalizedClientLink href={`/products/${product.handle}`} className="block">
        <div className="relative h-[360px]">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
          
          {/* Бейджи и кнопки */}
          <div className="absolute top-0 left-0 flex justify-between w-full">
            {/* Левый верхний угол - скидки или бейджи */}
            <div className="flex">
              {product.badges.map((badge) => (
                <div 
                  key={badge.id}
                  className={`${badge.color} h-10 w-[60px] text-xl font-semibold flex items-center justify-center`}
                >
                  {badge.text}%
                </div>
              ))}
            </div>
            
            {/* Правый верхний угол - кнопка избранного */}
            <button className="bg-[#07C4F5] h-10 w-10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Информация о доставке/наличии */}
          <div className="absolute bottom-0 right-0">
            <div className={`${product.isInStock ? 'bg-[rgba(0,0,0,0.6)]' : 'bg-[rgba(0,0,0,0.6)]'} backdrop-blur-sm px-3 py-1 text-xs text-white`}>
              {product.deliveryInfo}
            </div>
          </div>
          
          {/* Индикатор видео */}
          {product.hasVideo && (
            <div className="absolute bottom-3 left-3">
              <div className="bg-white/80 backdrop-blur-sm rounded-full h-10 w-10 flex items-center justify-center">
                <Play className="w-5 h-5 text-black" fill="black" />
              </div>
            </div>
          )}
          
          {/* Указатель "Нет в наличии" поверх изображения */}
          {!product.isInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-md">
                <Text className="text-white font-medium text-xl">Нет в наличии</Text>
              </div>
            </div>
          )}
        </div>
        
        {/* Контентная часть */}
        <div className="p-4 flex flex-col gap-4">
          {/* Категория и название */}
          <div className="space-y-2">
            <Text className="text-[#333333] opacity-60 text-base">
              {product.category}
            </Text>
            <Text className="font-medium text-[#333333] opacity-80 uppercase line-clamp-2 text-lg">
              {product.title}
            </Text>
          </div>
        </div>
      </LocalizedClientLink>
      
      {/* Блок цены и кнопки добавления в корзину */}
      <div className="mt-auto p-4 pt-0 flex justify-between items-center">
        {/* Кнопка корзины (слева) */}
        <button 
          className={`flex items-center justify-center w-10 h-10 rounded-md ${product.isInStock ? 'bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
          aria-label="Добавить в корзину"
          disabled={!product.isInStock}
        >
          <ShoppingBag className="w-5 h-5 text-white" />
        </button>
        
        {/* Блок цены (справа) */}
        <div className="flex flex-col items-end relative">
          {product.cheapestPrice && (
            <>
              {product.cheapestPrice.price_type === "sale" && product.cheapestPrice.original_price && (
                <>
                  <Text className="text-ui-fg-muted line-through opacity-50 text-sm">
                    {product.cheapestPrice.original_price}
                  </Text>
                  <Text className="text-ui-fg-base font-semibold text-base">
                    {product.cheapestPrice.calculated_price}
                  </Text>
                  {/* Линия перечеркивания */}
                  <div className="absolute top-[10px] h-[1px] w-full bg-[#07C4F5] -rotate-6"></div>
                </>
              )}
              {product.cheapestPrice.price_type !== "sale" && (
                <Text className="text-ui-fg-base font-semibold text-base">
                  {product.cheapestPrice.calculated_price}
                </Text>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 