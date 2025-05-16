"use client";
import * as React from "react";
import Image from 'next/image';

function WishlistDiscountBanner() {
  const imageUrl = "/images/banners/gift.png"; 

  return (
    <div className="relative w-full mt-10 md:mt-20 overflow-hidden h-[300px] lg:h-[50vh]">
      
      {/* Фоновое изображение с явными размерами */}
      <Image
        src={imageUrl}
        alt="Скидки на товары из вишлиста"
        width={1200}
        height={500}
        priority={false} 
        loading="lazy"
        quality={85}
        className="block w-full h-full object-cover"
      />

      {/* Контейнер для текста (оверлей) - выравнивание по левому краю */}
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-end p-6 md:p-10 lg:p-16 text-left">
        <div className="text-black max-w-sm"> 
          <span className="block text-lg md:text-xl lg:text-2xl leading-tight mb-1">
            Из вишлиста
          </span>
          <span className="block text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight">
            со скидками до −50%
          </span>
        </div>
      </div>
    </div>
  );
}

export default WishlistDiscountBanner; 