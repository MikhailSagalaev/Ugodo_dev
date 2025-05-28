"use client";
import * as React from "react";
import { HttpTypes } from "@medusajs/types";
import { useState, useEffect, useCallback } from "react";
import { clx } from "@medusajs/ui";
import useEmblaCarousel from 'embla-carousel-react';
import SafeImage from "@modules/common/components/safe-image";

interface ProductGalleryProps {
  images: HttpTypes.StoreProductImage[];
  mainImageSize?: { width: number; height: number };
  thumbnailSize?: { width: number; height: number };
  thumbnailsOnly?: boolean;
  mainImageOnly?: boolean;
}

function ProductGallery({ 
  images, 
  mainImageSize = { width: 989, height: 674 },
  thumbnailSize = { width: 70, height: 70 },
  thumbnailsOnly = false,
  mainImageOnly = false
}: ProductGalleryProps) {
  // Если изображений нет, показываем заглушку
  if (!images || images.length === 0) {
    return (
      <div 
        className="w-full rounded-md flex items-center justify-center"
        style={{ 
          width: `${mainImageSize.width}px`, 
          height: `${mainImageSize.height}px`,
          backgroundColor: "#f3f4f6" 
        }}
      >
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  // Ориентация для миниатюр - вертикальная
  const [thumbEmblaRef, thumbEmblaApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    slidesToScroll: 1,
    align: 'start',
    loop: false,
    axis: 'y', // Вертикальная ориентация
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi || !thumbEmblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi, thumbEmblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !thumbEmblaApi) return;
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);
    if (!thumbEmblaApi.scrollSnapList().includes(newIndex)) {
        thumbEmblaApi.scrollTo(newIndex);
    }
  }, [emblaApi, thumbEmblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
       emblaApi.off('select', onSelect);
       emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Если нужен только блок с миниатюрами
  if (thumbnailsOnly) {
    return (
      <div className="flex-shrink-0 overflow-hidden max-h-[500px]">
        <div className="flex flex-col h-full">
          {images.map((image, index) => {
            const thumbAltText = image.metadata?.alt as string || `Thumbnail ${index + 1}`;
            return (
              <div
                key={image.id}
                className={clx(
                  "relative my-1 w-full overflow-hidden cursor-pointer",
                  "aspect-square border-0 rounded-none",
                  {
                    "ring-1 ring-black opacity-75": index === selectedIndex,
                    "opacity-50": index !== selectedIndex,
                  }
                )}
                style={{ 
                  width: `${thumbnailSize.width}px`, 
                  height: `${thumbnailSize.height}px` 
                }}
              >
                <SafeImage
                  src={image.url}
                  alt={thumbAltText}
                  fill
                  sizes={`${thumbnailSize.width}px`}
                  style={{ objectFit: "cover" }}
                  className="absolute inset-0"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Если нужно только основное изображение
  if (mainImageOnly) {
    return (
      <div className="w-full h-full" style={{ width: `${mainImageSize.width}px`, height: `${mainImageSize.height}px` }}>
        <div className="relative w-full h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((image, index) => {
              const currentAltText = image.metadata?.alt as string || `Product image ${index + 1}`;
              return (
                <div key={image.id} className="embla__slide min-w-0 flex-[0_0_100%] relative">
                  <div className="relative w-full h-full overflow-hidden">
                    <SafeImage
                      src={image.url}
                      alt={currentAltText} 
                      fill
                      sizes={`${mainImageSize.width}px`}
                      style={{ objectFit: "cover" }}
                      priority={index === selectedIndex} 
                      data-testid="product-main-image"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Проверяем, если у нас только одно изображение
  if (images.length === 1) {
    return (
      <div className="w-full h-full" style={{ width: `${mainImageSize.width}px`, height: `${mainImageSize.height}px` }}>
        <div className="relative w-full h-full overflow-hidden" data-testid="product-main-image-container">
          <SafeImage
            src={images[0].url}
            alt={images[0].metadata?.alt as string || `Product image`}
            fill
            sizes={`${mainImageSize.width}px`}
            style={{ objectFit: "cover" }}
            priority={true}
            data-testid="product-main-image"
          />
        </div>
      </div>
    );
  }

  // Полная галерея с миниатюрами и основным изображением
  return (
    <div className="flex gap-x-2 h-full relative" style={{ width: `${mainImageSize.width}px`, height: `${mainImageSize.height}px` }}>
      {/* Колонка с миниатюрами слева - позиционируем по центру */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
        <div 
          className="flex-shrink-0 overflow-hidden max-h-[300px]"
          style={{ width: `${thumbnailSize.width}px` }}
          ref={thumbEmblaRef}
        >
          <div className="flex flex-col h-full">
            {images.map((image, index) => {
              const thumbAltText = image.metadata?.alt as string || `Thumbnail ${index + 1}`;
              return (
                <button
                  key={image.id}
                  onClick={() => onThumbClick(index)}
                  className={clx(
                    "relative my-1 w-full overflow-hidden cursor-pointer",
                    "aspect-square border-0 rounded-none",
                    {
                      "ring-1 ring-black opacity-75": index === selectedIndex,
                      "opacity-50": index !== selectedIndex,
                    }
                  )}
                  style={{ 
                    width: `${thumbnailSize.width}px`, 
                    height: `${thumbnailSize.height}px` 
                  }}
                  data-testid={`product-thumbnail-${image.id}`}
                >
                  <SafeImage
                    src={image.url}
                    alt={thumbAltText}
                    fill
                    sizes={`${thumbnailSize.width}px`}
                    style={{ objectFit: "cover" }}
                    className="absolute inset-0"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Основное изображение */}
      <div 
        className="relative flex-1 overflow-hidden" 
        style={{ marginLeft: `${thumbnailSize.width + 20}px`, width: `${mainImageSize.width - thumbnailSize.width - 20}px` }}
        ref={emblaRef}
      >
        <div className="flex h-full">
          {images.map((image, index) => {
            const currentAltText = image.metadata?.alt as string || `Product image ${index + 1}`;

            return (
              <div key={image.id} className="embla__slide min-w-0 flex-[0_0_100%] relative">
                <div className="relative w-full h-full overflow-hidden" data-testid="product-main-image-container">
                  <SafeImage
                    src={image.url}
                    alt={currentAltText} 
                    fill
                    sizes={`${mainImageSize.width - thumbnailSize.width - 20}px`}
                    style={{ objectFit: "cover" }}
                    priority={index === selectedIndex} 
                    data-testid="product-main-image"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductGallery; 