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
  // Инициализируем источник изображения
  const [imgSrc, setImgSrc] = useState<string>(startWithPlaceholder ? fallbackSrc : (src as string))
  const [hadError, setHadError] = useState(false)
  const [isLoading, setIsLoading] = useState(startWithPlaceholder)
  
  // Обновляем источник при изменении src
  useEffect(() => {
    if (!src || hadError) return
    
    // Если не начинаем с заглушки или уже был один запрос, сразу обновляем src
    if (!startWithPlaceholder || imgSrc !== fallbackSrc) {
      setImgSrc(src as string)
      return
    }
    
    // Пытаемся предзагрузить изображение, только если начинаем с заглушки
    if (startWithPlaceholder && src && imgSrc === fallbackSrc) {
      setIsLoading(true)
      
      const img = new window.Image()
      img.src = src as string
      
      const handleLoad = () => {
        setImgSrc(src as string)
        setIsLoading(false)
        img.removeEventListener('load', handleLoad)
        img.removeEventListener('error', handleError)
      }
      
      const handleError = () => {
        setImgSrc(fallbackSrc)
        setHadError(true)
        setIsLoading(false)
        img.removeEventListener('load', handleLoad)
        img.removeEventListener('error', handleError)
      }
      
      img.addEventListener('load', handleLoad)
      img.addEventListener('error', handleError)
      
      return () => {
        img.removeEventListener('load', handleLoad)
        img.removeEventListener('error', handleError)
      }
    }
  }, [src, fallbackSrc, startWithPlaceholder, hadError, imgSrc])
  
  // Обработчик ошибок для случая, когда мы начинаем с реального изображения
  const handleError = () => {
    if (!hadError) {
      setImgSrc(fallbackSrc)
      setHadError(true)
    }
  }

  return (
    <Image
      {...rest}
      src={imgSrc || fallbackSrc}
      alt={alt || "Product image"}
      onError={handleError}
      className={`${rest.className || ''} ${isLoading ? 'opacity-70' : ''}`}
    />
  )
}

export default SafeImage 