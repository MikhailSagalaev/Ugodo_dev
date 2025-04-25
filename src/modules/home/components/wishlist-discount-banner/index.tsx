"use client";
import * as React from "react";
import Image from 'next/image';

function WishlistDiscountBanner() {
  // Предполагаемый путь к изображению в папке public
  const imageUrl = "/images/banners/Picture → 5f6d756c7469536f75726365436f6d6d6f6e8dd575389755c63fullhd.webp (1).png"; // Обновленный путь

  return (
    <div className="relative flex flex-col items-end self-center w-full max-w-4xl mx-auto mt-10 md:mt-20 overflow-hidden rounded-lg min-h-[300px] md:min-h-[400px]"> {/* Адаптивная высота и отступы */} 
      {/* Фоновое изображение */}
      <Image
        src={imageUrl} // Используем переменную
        alt="Скидки на товары из вишлиста"
        fill
        priority={false} // Скорее всего, этот баннер не в первой видимой области
        loading="lazy"
        quality={85}
        className="object-cover absolute inset-0 size-full -z-10" // z-index чтобы текст был поверх
        style={{ objectFit: "cover" }} // objectFit для корректного заполнения
      />
      {/* Контейнер для текста */} 
      <div className="relative z-10 p-6 md:p-10 lg:p-16 text-right"> {/* Добавляем отступы */} 
        <div className="text-black max-w-sm"> {/* Ограничиваем ширину текста */}
          <span className="block text-xl md:text-2xl lg:text-3xl leading-tight mb-1">Из вишлиста</span>
          <span className="block text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
            со скидками до −50%
          </span>
        </div>
      </div>
    </div>
  );
}

export default WishlistDiscountBanner; 