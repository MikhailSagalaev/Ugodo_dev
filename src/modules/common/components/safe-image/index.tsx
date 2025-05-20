"use client"

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

const PLACEHOLDER_IMAGE = "/images/placeholder.png"

// Расширяем свойства Image для поддержки запасного изображения
export interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  startWithPlaceholder?: boolean;
}

/**
 * Компонент SafeImage - безопасное отображение изображений с заглушкой при ошибках
 * Может начинать с заглушки и затем загружать реальное изображение
 */
const SafeImage = ({ 
  src,
  alt, 
  fallbackSrc = PLACEHOLDER_IMAGE,
  startWithPlaceholder = false,
  ...rest 
}: SafeImageProps) => {
  // Начинаем с заглушки или с реального изображения в зависимости от настроек
  const [imgSrc, setImgSrc] = useState(src)
  const [hadError, setHadError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Если мы начинаем с заглушки, пытаемся загрузить реальное изображение
  useEffect(() => {
    if (startWithPlaceholder && src) {
      setIsLoading(true);
      
      const img = new window.Image();
      img.src = src as string;
      
      img.onload = () => {
        setImgSrc(src);
        setIsLoading(false);
      };
      
      img.onerror = () => {
        setImgSrc(fallbackSrc);
        setHadError(true);
        setIsLoading(false);
      };
    }
  }, [src, startWithPlaceholder, fallbackSrc]);

  // Обработчик ошибок для случая, когда мы начинаем с реального изображения
  const handleError = () => {
    if (!hadError) {
      setImgSrc(fallbackSrc);
      setHadError(true);
    }
  }

  return (
    <Image
      {...rest}
      src={imgSrc}
      alt={alt || "Product image"}
      onError={handleError}
      className={`${rest.className || ''} ${isLoading ? 'opacity-70' : ''}`}
    />
  )
}

export default SafeImage 