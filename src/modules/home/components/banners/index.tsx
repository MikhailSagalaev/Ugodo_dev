"use client";
import * as React from "react";
import Image from 'next/image'; // Используем next/image для оптимизации
import { Text } from '@medusajs/ui';

function HomeBanners() { // Переименуем для ясности
  return (
    <div className="relative flex items-end w-full overflow-hidden text-black max-w-[1415px] mx-auto mt-6 md:mt-10" style={{ borderRadius: '48px', height: '433px' }}> 
      {/* Фоновое изображение с использованием next/image */}
      <Image
        // src="https://cdn.builder.io/api/v1/image/assets/TEMP/d069fa88fc3e1573e7e76d636cc32c3f8d20a919?placeholderIfAbsent=true&apiKey=61ffe663603f4de3aa93a6286a9db479"
        // Заглушка, пока нет реального изображения
        src="/images/banners/banner.png" // Обновленный путь
        fill
        loading="eager" // Или 'lazy', если баннер не в первой видимой области
        priority={true} // Если баннер в первой видимой области
        quality={90}
        style={{ objectFit: "cover" }}
        className="absolute inset-0 size-full -z-10" // Добавляем z-index, чтобы текст был поверх
        alt="Экспресс доставка баннер фон"
      />

    </div>
  );
}

// Базовая заглушка для InfoBanner, чтобы исправить ошибку типов
// Вам нужно будет заменить это на реальную реализацию InfoBanner, если она требуется
type InfoBannerProps = {
  title: string;
  description: string;
  variant?: string; // Добавляем variant, так как он используется
  // Добавьте другие пропсы, если они нужны
};

const InfoBanner = ({ title, description, variant }: InfoBannerProps) => {
  // Простая заглушка для отображения
  // Стилизация может быть добавлена позже или взята из оригинального компонента
  const bgColor = variant === 'secondary' ? 'bg-gradient-to-r from-violet-50 to-pink-50' : 'bg-gray-100';
  const textColor = variant === 'secondary' ? 'text-violet-600' : 'text-black';

  return (
    <div className={`p-6 my-8 rounded-md ${bgColor}`}>
      <div className={`text-2xl font-semibold mb-2 ${textColor}`}>{title}</div>
      <Text className="text-gray-700">{description}</Text>
      {/* Можно добавить кнопку, если нужно */}
    </div>
  );
};

export default InfoBanner; 