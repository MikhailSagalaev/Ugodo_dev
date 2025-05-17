/**
 * @file: index.tsx
 * @description: Компонент для отображения блока популярных категорий на главной странице.
 * @dependencies: React, Next.js (LocalizedClientLink, Image), @medusajs/types, @medusajs/ui (Heading)
 * @created: 2024-07-30
 */

import React from "react";
import { Heading } from "@medusajs/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { HttpTypes } from "@medusajs/types";
import Image from "next/image"; // Для изображений категорий

interface PopularCategoryCardProps {
  category: HttpTypes.StoreProductCategory;
  countryCode: string;
}

const PopularCategoryCard: React.FC<PopularCategoryCardProps> = ({ category, countryCode }) => {
  // Предполагаем, что у категории может быть изображение в metadata или как thumbnail
  // Для примера используем плейсхолдер, если изображения нет
  const categoryImageUrl = category.metadata?.image_url as string || `https://via.placeholder.com/300x200.png/BAFF29/000000?text=${encodeURIComponent(category.name)}`;
  const categoryHandle = category.handle || (category.name.toLowerCase().replace(/\s+/g, '-'));

  return (
    <LocalizedClientLink href={`/categories/${categoryHandle}?countryCode=${countryCode}`} className="group">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md bg-ui-bg-subtle shadow-elevation-card-rest transition-shadow duration-200 group-hover:shadow-elevation-card-hover">
        <Image 
          src={categoryImageUrl}
          alt={category.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200.png/BAFF29/000000?text=${encodeURIComponent(category.name)}`; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-colors duration-200 flex items-end p-4">
          <Heading level="h3" className="text-xl font-semibold text-white drop-shadow-md">
            {category.name}
          </Heading>
        </div>
      </div>
    </LocalizedClientLink>
  );
};

interface PopularCategoriesProps {
  categories: HttpTypes.StoreProductCategory[];
  countryCode: string;
  title?: string;
}

const PopularCategories: React.FC<PopularCategoriesProps> = ({ 
  categories, 
  countryCode,
  title = "Популярные категории"
}) => {
  if (!categories || categories.length === 0) {
    return null; // Не отображаем блок, если нет категорий
  }

  return (
    <div className="content-container py-8 md:py-12">
      <Heading level="h2" className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-center md:text-left">
        {title}
      </Heading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categories.slice(0, 6).map((category) => ( // Ограничиваем до 6 категорий
          <PopularCategoryCard key={category.id} category={category} countryCode={countryCode} />
        ))}
      </div>
    </div>
  );
};

export default PopularCategories; 