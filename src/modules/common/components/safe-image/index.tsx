"use client"

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'

const PLACEHOLDER_IMAGE = "/images/placeholder.png"

// Расширяем свойства Image для поддержки запасного изображения
export interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
}

/**
 * Компонент SafeImage - безопасное отображение изображений с заглушкой при ошибках
 * Может начинать с заглушки и затем загружать реальное изображение
 */
const SafeImage = ({ 
  src,
  alt, 
  fallbackSrc = PLACEHOLDER_IMAGE,
  ...rest 
}: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState<string>(src as string)
  const [hasError, setHasError] = useState(false)
  
  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  return (
    <Image
      {...rest}
      src={imgSrc || fallbackSrc}
      alt={alt || "Product image"}
      onError={handleError}
    />
  )
}

export default SafeImage 