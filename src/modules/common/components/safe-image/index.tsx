"use client"

import React, { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

// Встроенное изображение-заглушка для предотвращения ошибок 500
const PLACEHOLDER_IMAGE = "data:image/png;base64,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"

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
  const [imgSrc, setImgSrc] = useState(startWithPlaceholder ? fallbackSrc : src)
  const [hadError, setHadError] = useState(false)
  const [isLoading, setIsLoading] = useState(startWithPlaceholder)

  // Если мы начинаем с заглушки, пытаемся загрузить реальное изображение
  useEffect(() => {
    if (startWithPlaceholder && src) {
      const img = new window.Image();
      img.src = src as string;
      
      img.onload = () => {
        setImgSrc(src);
        setIsLoading(false);
        console.log(`Image loaded successfully: ${alt || 'unnamed image'}`);
      };
      
      img.onerror = () => {
        setHadError(true);
        setIsLoading(false);
        console.warn(`Image failed to load, keeping placeholder: ${alt || 'unnamed image'}`);
      };
    }
  }, [src, alt, startWithPlaceholder, fallbackSrc]);

  // Обработчик ошибок для случая, когда мы начинаем с реального изображения
  const handleError = () => {
    if (!hadError) {
      setImgSrc(fallbackSrc);
      setHadError(true);
      console.warn(`Image failed to load, using placeholder: ${alt || 'unnamed image'}`);
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