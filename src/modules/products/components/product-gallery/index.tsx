"use client";
import * as React from "react";
import { HttpTypes } from "@medusajs/types";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { clx } from "@medusajs/ui";
import useEmblaCarousel from 'embla-carousel-react';
import { EmblaOptionsType } from 'embla-carousel';
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Maximize, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ProductGalleryProps {
  images: HttpTypes.StoreProductImage[];
}

function ProductGallery({ images }: ProductGalleryProps) {
  // Если изображений нет, показываем заглушку
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] sm:aspect-[440/480] bg-gray-100 rounded-md flex items-center justify-center mx-auto">
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

  const [thumbEmblaRef, thumbEmblaApi] = useEmblaCarousel();

  const [isMobileView, setIsMobileView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialModalIndex, setInitialModalIndex] = useState(0);

  // Карусель для модального окна
  const [modalEmblaRef, modalEmblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768); 
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!thumbEmblaApi) return;
    const options: EmblaOptionsType = {
      containScroll: 'keepSnaps',
      dragFree: true,
      slidesToScroll: 1,
      align: 'start' as 'start' | 'center' | 'end',
      loop: false,
      axis: isMobileView ? 'x' : 'y',
    };
    thumbEmblaApi.reInit(options);
  }, [thumbEmblaApi, isMobileView]);

  useEffect(() => {
    if (isModalOpen && modalEmblaApi) {
      modalEmblaApi.scrollTo(initialModalIndex, true); // true для мгновенной прокрутки
    }
  }, [isModalOpen, initialModalIndex, modalEmblaApi]);

  const scrollPrevModal = useCallback(() => modalEmblaApi && modalEmblaApi.scrollPrev(), [modalEmblaApi]);
  const scrollNextModal = useCallback(() => modalEmblaApi && modalEmblaApi.scrollNext(), [modalEmblaApi]);

  const openModal = (index: number) => {
    setInitialModalIndex(index);
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }

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
    if (thumbEmblaApi.scrollSnapList().length > 0 && !thumbEmblaApi.scrollSnapList().includes(newIndex)) {
      thumbEmblaApi.scrollTo(newIndex);
    } else if (thumbEmblaApi.selectedScrollSnap() !== newIndex) {
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
  
  const thumbContainerClasses = clx(
    "flex-shrink-0 overflow-hidden rounded-md",
    {
      "w-full order-2 mt-3": isMobileView,
      "w-[160px] h-[calc((160px+theme('spacing.2'))*3-theme('spacing.1'))] order-1 mr-3": !isMobileView,
    }
  );

  const thumbSlidesClasses = clx(
    "relative",
    {
      "flex-[0_0_22%] sm:flex-[0_0_20%]": isMobileView,
      "flex-[0_0_calc(100%/3)]": !isMobileView,
    }
  );
  
  const mainImageContainerAspect = isMobileView ? "aspect-[4/3]" : "aspect-[440/480]";

  return (
    <>
      <div className={clx("flex items-start w-full", {"flex-col": isMobileView, "flex-row": !isMobileView})}>
        {/* Колонка/строка с миниатюрами */}
        {images.length > 1 && (
          <div 
            className={thumbContainerClasses}
            ref={thumbEmblaRef}
          >
            <div className={clx("flex h-full", {"flex-row": isMobileView, "flex-col": !isMobileView})}>
              {images.map((image, index) => {
                const thumbAltText = image.metadata?.alt as string || `Thumbnail ${index + 1}`;
                return (
                  <div 
                    key={image.id} 
                    className={clx(thumbSlidesClasses, {"px-1 first:pl-0 last:pr-0": isMobileView, "py-1 pr-1": !isMobileView})}
                  >
                    <button
                      onClick={() => onThumbClick(index)}
                      className={clx(
                        "relative aspect-square w-full overflow-hidden rounded-md border border-ui-border-base block", 
                        {
                          "border-ui-border-interactive ring-1 ring-ui-border-interactive": index === selectedIndex
                        }
                      )}
                      data-testid={`product-thumbnail-${image.id}`}
                    >
                      <Image
                        src={image.url}
                        alt={thumbAltText}
                        fill
                        sizes={isMobileView ? "80px" : "160px"}
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

        {/* Основное изображение */}
        <div 
          className={clx(
              "relative overflow-hidden rounded-md w-full group",
              {"order-1": isMobileView, "flex-1 order-2": !isMobileView},
              mainImageContainerAspect
          )} 
          ref={emblaRef}
        >
          <div className="flex h-full">
            {images.map((image, index) => {
              const currentAltText = image.metadata?.alt as string || `Product image ${index + 1}`;

              return (
                <div key={image.id} className="embla__slide min-w-0 flex-[0_0_100%] relative">
                  <div className={clx("relative w-full overflow-hidden", mainImageContainerAspect)} data-testid="product-main-image-container">
                    <Image
                      src={image.url}
                      alt={currentAltText} 
                      fill
                      sizes="(max-width: 767px) 100vw, (max-width: 1024px) 70vw, 40vw"
                      style={{ objectFit: "cover" }}
                      priority={index === selectedIndex} 
                      data-testid="product-main-image"
                    />
                    {isMobileView && (
                      <button 
                        onClick={() => openModal(index)} 
                        className="absolute top-2 right-2 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
                        aria-label="Открыть на весь экран"
                      >
                        <Maximize size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Модальное окно для полноэкранного просмотра */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/85" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-1 sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full h-full sm:max-w-4xl sm:h-auto sm:max-h-[90vh] transform overflow-hidden rounded-none sm:rounded-lg bg-black text-white p-0 sm:p-2 flex flex-col">
                  <div className="flex justify-between items-center p-3 sm:p-1 absolute top-0 left-0 right-0 z-10 bg-black/30 sm:bg-transparent">
                    <Dialog.Title as="h3" className="text-base font-medium">
                      {images[modalEmblaApi?.selectedScrollSnap() || initialModalIndex]?.metadata?.alt as string || `Изображение ${ (modalEmblaApi?.selectedScrollSnap() || initialModalIndex) + 1 }`}
                    </Dialog.Title>
                    <button onClick={closeModal} className="p-2 rounded-full hover:bg-white/20">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-center relative mt-12 sm:mt-8 mb-8 sm:mb-0">
                    <div className="overflow-hidden w-full h-full" ref={modalEmblaRef}>
                      <div className="flex h-full">
                        {images.map((image, index) => (
                          <div key={`modal-${image.id}`} className="embla__slide min-w-0 flex-[0_0_100%] h-full flex items-center justify-center">
                            <img 
                              src={image.url} 
                              alt={image.metadata?.alt as string || `Image ${index + 1}`} 
                              className="max-h-[85vh] max-w-full object-contain"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    {images.length > 1 && (
                      <>
                        <button 
                          onClick={scrollPrevModal} 
                          className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 rounded-full hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!modalEmblaApi?.canScrollPrev()}
                          aria-label="Предыдущее изображение"
                        >
                          <ChevronLeft size={28} />
                        </button>
                        <button 
                          onClick={scrollNextModal} 
                          className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/40 rounded-full hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!modalEmblaApi?.canScrollNext()}
                          aria-label="Следующее изображение"
                        >
                          <ChevronRight size={28} />
                        </button>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

export default ProductGallery; 