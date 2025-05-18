"use client";
import * as React from "react";
import Image from "next/image"; // Используем next/image
import { HttpTypes } from "@medusajs/types";

// Используем тип изображения Medusa
interface GalleryItemProps {
  image: HttpTypes.StoreProductImage; // Принимаем объект изображения Medusa
  onClick?: (imageId: string) => void;
}

// Заглушки из примера пользователя (можно вынести или заменить)
const videoIconSrc = "https://cdn.builder.io/api/v1/image/assets/TEMP/ec9124025a4018bca5a939d85a4b06c9aa96e4a7?placeholderIfAbsent=true&apiKey=61ffe663603f4de3aa93a6286a9db479";
const duration = "В течении часа"; // Или можно брать из image.metadata

function GalleryItem({ image, onClick }: GalleryItemProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(image.id); // Передаем ID изображения
    }
  };

  const handleClick = () => {
    onClick?.(image.id); // Передаем ID изображения
  };

  // Пытаемся получить alt текст, если нет, используем пустую строку
  const altText = image.metadata?.alt as string || `Product image ${image.rank || ''}`.trim();
  const itemDuration = image.metadata?.duration as string || duration; // Пример получения из метаданных

  return (
    <div
      className="relative aspect-[440/480] w-full overflow-hidden rounded-md group cursor-pointer" // Адаптируем стили
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View image ${altText}`}
      data-testid="gallery-item"
    >
      <Image
        src={image.url}
        alt={altText}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        style={{ objectFit: "cover" }}
        className="absolute inset-0 size-full transition-transform duration-300 ease-in-out group-hover:scale-105"
        data-testid="gallery-item-image"
      />
      {/* Оверлей с иконкой видео и временем */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-2.5 justify-between items-end p-3 z-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
        {/* Условие показа видео иконки (например, если есть duration в метаданных) */}
        {Boolean(image.metadata?.duration) && (
          <div
            className="flex justify-center items-center p-1.5 bg-black/60 rounded-md pointer-events-auto"
            aria-hidden="true"
            data-testid="gallery-item-video-icon"
          >
            <Image
              src={videoIconSrc}
              alt=""
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
        )}
        {/* Пустой div для выравнивания */}
         {!image.metadata?.duration && <div className="w-0"></div>}

        <div
          className="px-2 py-1 text-xs text-right text-white rounded bg-black/60 pointer-events-auto"
          aria-label={`Duration: ${itemDuration}`}
          data-testid="gallery-item-duration"
        >
          {itemDuration}
        </div>
      </div>
    </div>
  );
}

export default GalleryItem; 