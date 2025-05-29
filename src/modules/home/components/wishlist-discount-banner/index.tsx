"use client";
import * as React from "react";
import { useState, useEffect } from 'react';
import Image from 'next/image';

function WishlistDiscountBanner() {
  const imageUrl = "/images/banners/gift.png"; 
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative w-full mt-10 md:mt-20 overflow-hidden">
      
      <Image
        src={imageUrl}
        alt="Скидки на товары из вишлиста"
        width={1200}
        height={500}
        priority={false} 
        loading="lazy"
        quality={85}
        className="block w-full h-auto object-cover"
      />

      {/* Контейнер для текста (оверлей) - выравнивание по левому краю */}
      <div className="absolute inset-0 z-10 flex flex-col items-start justify-center p-6 md:p-10 lg:p-16 text-left"> 
        <div className="text-black max-w-sm"> 
          <span className="block text-xl md:text-2xl lg:text-3xl leading-tight mb-1">
            Из вишлиста
          </span>
          <span className="block text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            со скидками до −50%
          </span>
        </div>
      </div>
    </div>
  );
}

export default WishlistDiscountBanner; 