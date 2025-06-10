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
    <div className="relative w-full mt-10 md:mt-20 overflow-hidden max-w-[1415px] mx-auto" style={{ borderRadius: '48px', height: '433px' }}>
      
      <Image
        src={imageUrl}
        alt="Скидки на товары из вишлиста"
        fill
        priority={false} 
        loading="lazy"
        quality={85}
        className="object-cover"
      />


    </div>
  );
}

export default WishlistDiscountBanner; 