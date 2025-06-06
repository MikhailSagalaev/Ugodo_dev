import React, { useState, useEffect } from "react"
import Image from "next/image"

type AdaptiveImageProps = {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  priority?: boolean
  sizes?: string
  quality?: number
  fill?: boolean
  width?: number
  height?: number
  maxAspectRatio?: number // Максимальное соотношение сторон (для очень широких изображений)
  minAspectRatio?: number // Минимальное соотношение сторон (для очень высоких изображений)
}

const AdaptiveImage: React.FC<AdaptiveImageProps> = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  priority = false,
  sizes,
  quality = 75,
  fill = true,
  width,
  height,
  maxAspectRatio = 2.5, // Максимум 2.5:1 (широкие изображения)
  minAspectRatio = 0.4,  // Минимум 0.4:1 (высокие изображения)
}) => {
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (src) {
      const img = new window.Image()
      img.onload = () => {
        let aspectRatio = img.width / img.height
        
        // Ограничиваем соотношение сторон в разумных пределах
        if (aspectRatio > maxAspectRatio) {
          aspectRatio = maxAspectRatio
        } else if (aspectRatio < minAspectRatio) {
          aspectRatio = minAspectRatio
        }
        
        setImageAspectRatio(aspectRatio)
        setImageLoaded(true)
      }
      img.onerror = () => {
        setImageError(true)
        setImageLoaded(true)
      }
      img.src = src
    }
  }, [src, maxAspectRatio, minAspectRatio])

  const getContainerStyle = () => {
    if (!imageLoaded || !imageAspectRatio || imageError) {
      return { aspectRatio: "1" } // Квадрат по умолчанию
    }
    return { aspectRatio: imageAspectRatio.toString() }
  }

  if (imageError) {
    return (
      <div 
        className={`relative bg-gray-100 flex items-center justify-center ${containerClassName}`}
        style={{ aspectRatio: "1" }}
      >
        <div className="text-gray-400 text-sm">Изображение недоступно</div>
      </div>
    )
  }

  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={getContainerStyle()}
    >
      <Image
        src={src}
        alt={alt}
        className={`object-contain w-full h-full ${className}`}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        priority={priority}
        sizes={sizes}
        quality={quality}
      />
      
      {/* Показываем placeholder пока изображение загружается */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  )
}

export default AdaptiveImage 