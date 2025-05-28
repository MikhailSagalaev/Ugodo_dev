'use client'

import { useState, useEffect } from 'react'
import { Button } from "@medusajs/ui"
import SafeImage from "@modules/common/components/safe-image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface PromoBannerProps {
  title: string
  subtitle?: string
  buttonText?: string
  buttonLink?: string
  imageUrl?: string
  backgroundColor?: string
  textColor?: string
  buttonColor?: string
  position?: 'left' | 'center' | 'right'
  className?: string
}

const PromoBanner = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  imageUrl,
  backgroundColor = '#f8f9fa',
  textColor = '#000000',
  buttonColor = '#000000',
  position = 'center',
  className = ''
}: PromoBannerProps) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const textAlignment = position === 'left' ? 'text-left' : position === 'right' ? 'text-right' : 'text-center'
  const justifyContent = position === 'left' ? 'justify-start' : position === 'right' ? 'justify-end' : 'justify-center'

  return (
    <div 
      className={`relative w-full h-[400px] md:h-[500px] overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      {imageUrl && (
        <SafeImage
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      )}
      
      <div className={`absolute inset-0 flex items-center ${justifyContent} p-6 md:p-12`}>
        <div className={`max-w-lg ${textAlignment}`} style={{ color: textColor }}>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {title}
          </h2>
          
          {subtitle && (
            <p className="text-lg md:text-xl mb-6 opacity-90">
              {subtitle}
            </p>
          )}
          
          {buttonText && buttonLink && (
            <LocalizedClientLink href={buttonLink}>
              <Button 
                variant="secondary"
                size="large"
                className="font-semibold"
                style={{ 
                  backgroundColor: buttonColor,
                  color: backgroundColor,
                  border: `2px solid ${buttonColor}`
                }}
              >
                {buttonText}
              </Button>
            </LocalizedClientLink>
          )}
        </div>
      </div>
    </div>
  )
}

export default PromoBanner 