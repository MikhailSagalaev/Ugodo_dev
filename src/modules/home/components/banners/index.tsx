"use client";
import * as React from "react";
import Image from 'next/image'; // Используем next/image для оптимизации
import { Text } from '@medusajs/ui';

function HomeBanners() { // Переименуем для ясности
  return (
    <div className="relative flex items-end w-full overflow-hidden text-black min-h-[500px] md:min-h-[600px] lg:min-h-[700px] mt-6 md:mt-10 rounded-md"> {/* Убрал pt-96, используем items-end и pb, добавил отступы */} 
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
      {/* Контейнер для текста с отступами */} 
      <div className="relative z-10 p-6 md:p-10 lg:p-16 max-w-full md:max-w-lg lg:max-w-xl"> {/* Добавил отступы и ограничение ширины */}
        <div className="text-lg md:text-xl lg:text-2xl leading-tight text-gray-800 mb-1 md:mb-2">
          в течении одного часа
        </div>
        <div className="text-4xl md:text-5xl lg:text-6xl tracking-tight font-semibold leading-tight text-black">
          Экспресс доставка
        </div>
        {/* Можно добавить кнопку */}
        {/* <button className="mt-4 md:mt-6 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors">Подробнее</button> */}
      </div>
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