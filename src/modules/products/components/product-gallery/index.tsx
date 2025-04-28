"use client";
import * as React from "react";
import { HttpTypes } from "@medusajs/types";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { clx } from "@medusajs/ui";
import useEmblaCarousel from 'embla-carousel-react';

interface ProductGalleryProps {
  images: HttpTypes.StoreProductImage[];
}

function ProductGallery({ images }: ProductGalleryProps) {
  // Если изображений нет, показываем заглушку
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[440/480] bg-gray-100 rounded-md flex items-center justify-center">
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

  const [thumbEmblaRef, thumbEmblaApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
    slidesToScroll: 1,
    align: 'start',
    loop: false,
    axis: 'y',
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

  return (
    <div className="flex flex-row gap-x-4 h-full">
      {/* Колонка с миниатюрами - теперь с Embla и ограничением высоты */}
      {images.length > 1 && (
        <div className="w-[160px] h-[calc(160px*3+8px*2)] flex-shrink-0 overflow-hidden rounded-md" ref={thumbEmblaRef}>
          <div className="flex flex-col h-full">
            {images.map((image, index) => {
              const thumbAltText = image.metadata?.alt as string || `Thumbnail ${index + 1}`;
              return (
                <div key={image.id} className="embla-thumbs__slide relative flex-[0_0_160px] py-1 pr-1">
                  <button
                    onClick={() => onThumbClick(index)}
                    className={clx(
                      "relative aspect-square w-full overflow-hidden rounded-md border border-ui-border-base block", 
                      {
                        "border-ui-border-interactive ring-2 ring-ui-border-interactive": index === selectedIndex
                      }
                    )}
                    data-testid={`product-thumbnail-${image.id}`}
                  >
                    <Image
                      src={image.url}
                      alt={thumbAltText}
                      fill
                      sizes="160px"
                      style={{ objectFit: "cover" }}
                      className="absolute inset-0"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Основное изображение - теперь с Embla */}
      <div className="relative overflow-hidden w-full flex-1 rounded-md" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => {
             const currentAltText = image.metadata?.alt as string || `Product image ${index + 1}`;
             const currentLabelText = image.metadata?.duration as string
                                   || image.metadata?.availability as string 
                                   || "В течении часа";

            return (
              <div key={image.id} className="embla__slide min-w-0 flex-[0_0_100%] relative">
                <div className="relative aspect-[440/480] w-full overflow-hidden" data-testid="product-main-image-container">
                  <Image
                    src={image.url}
                    alt={currentAltText} 
                    fill
                    sizes="(max-width: 1024px) 70vw, 40vw"
                    style={{ objectFit: "cover" }}
                    priority={index === selectedIndex} 
                    data-testid="product-main-image"
                  />
                  <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
                     <div className="px-2 py-1 text-xs text-right text-white rounded bg-black/60 pointer-events-auto">
                       {currentLabelText}
                     </div>
                  </div>
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