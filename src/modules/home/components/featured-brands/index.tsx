"use client";

/**
 * @file: index.tsx
 * @description: Компонент для отображения блока избранных брендов (коллекций) на главной странице.
 * @dependencies: React, Next.js (LocalizedClientLink, Image), @medusajs/types, @medusajs/ui (Heading)
 * @created: 2024-07-30
 */

import React from "react";
import { Heading } from "@medusajs/ui";
import LocalizedClientLink from "@modules/common/components/localized-client-link";
import { HttpTypes } from "@medusajs/types";
import Image from "next/image";

interface BrandCardProps {
  collection: HttpTypes.StoreCollection;
  countryCode: string;
}

const BrandCard: React.FC<BrandCardProps> = ({ collection, countryCode }) => {
  const brandImageUrl = collection.metadata?.logo_url as string || `https://via.placeholder.com/150x80.png/EEEEEE/000000?text=${encodeURIComponent(collection.title)}`;
  
  return (
    <LocalizedClientLink 
      href={`/collections/${collection.handle}?countryCode=${countryCode}`}
      className="group block p-4 border border-ui-border-base rounded-md hover:shadow-md transition-shadow duration-200 bg-white"
    >
      <div className="relative w-full h-20 mb-3 flex items-center justify-center">
        <Image 
          src={brandImageUrl}
          alt={`${collection.title} logo`}
          width={120} // Примерные размеры, можно настроить
          height={60}
          objectFit="contain"
          className="transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/150x80.png/EEEEEE/000000?text=${encodeURIComponent(collection.title)}`; }}
        />
      </div>
      <Heading level="h3" className="text-center text-sm font-medium text-ui-fg-subtle group-hover:text-ui-fg-base transition-colors">
        {collection.title}
      </Heading>
    </LocalizedClientLink>
  );
};

interface FeaturedBrandsProps {
  collections: HttpTypes.StoreCollection[];
  countryCode: string;
  title?: string;
}

const FeaturedBrands: React.FC<FeaturedBrandsProps> = ({ 
  collections, 
  countryCode,
  title = "Популярные бренды"
}) => {
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <div className="content-container py-8 md:py-12">
      <Heading level="h2" className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8 text-center md:text-left">
        {title}
      </Heading>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {collections.slice(0, 12).map((collection) => ( // Ограничиваем до 12 брендов
          <BrandCard key={collection.id} collection={collection} countryCode={countryCode} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedBrands; 