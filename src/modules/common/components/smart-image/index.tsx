import React, { useState, useEffect } from "react"
import Image from "next/image"

type SmartImageProps = {
  src: string
  alt: string
  className?: string
  containerClassName?: string
  priority?: boolean
  sizes?: string
  quality?: number
  aspectRatio?: string // по умолчанию "3/4"
}

const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  priority = false,
  sizes,
  quality = 75,
  aspectRatio = "3/4",
}) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)

  useEffect(() => {
    if (src) {
      const img = new window.Image()
      img.onload = () => {
        const ratio = img.width / img.height
        setImageAspectRatio(ratio)
        setImageLoaded(true)
      }
      img.onerror = () => {
        setImageError(true)
        setImageLoaded(true)
      }
      img.src = src
    }
  }, [src])

  // Определяем как лучше отобразить изображение
  const getImageStyle = () => {
    if (!imageLoaded || !imageAspectRatio || imageError) {
      return "object-cover"
    }

    const targetRatio = 3/4 // соотношение 3:4
    
    // Если изображение уже близко к нужному соотношению (±10%), используем cover
    if (Math.abs(imageAspectRatio - targetRatio) < 0.1) {
      return "object-cover"
    }
    
    // Если изображение слишком широкое или слишком высокое, используем contain с фоном
    if (imageAspectRatio > targetRatio * 1.3 || imageAspectRatio < targetRatio * 0.7) {
      return "object-contain"
    }
    
    // В остальных случаях используем cover для заполнения
    return "object-cover"
  }

  const imageStyle = getImageStyle()
  const needsBackground = imageStyle === "object-contain"

  if (imageError) {
    return (
      <div 
        className={`relative bg-gray-100 flex items-center justify-center ${containerClassName}`}
        style={{ aspectRatio }}
      >
        <div className="text-gray-400 text-sm">Изображение недоступно</div>
      </div>
    )
  }

  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ 
        aspectRatio,
        backgroundColor: needsBackground ? '#f8f9fa' : 'transparent'
      }}
    >
      <Image
        src={src}
        alt={alt}
        className={`w-full h-full ${imageStyle} ${className}`}
        fill
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

export default SmartImage 