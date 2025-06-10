'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from "next/image"
import { Button, Heading, Text, Container } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

interface Slide {
  id: number
  headline: string
  title: string
  image: string
  video?: string
  videoDesktop?: string
  videoMobile?: string
  textAlign?: 'left' | 'right'
  cta: {
    text: string
    link: string
  }
}

const slides: Slide[] = [
  {
    id: 1,
    headline: "на товары для дома",
    title: "СКИДКА ДО 20%",
    image: "/images/hero/доставка бирюза 2.png",
    cta: {
      text: "Подробнее",
      link: "/collections/sale"
    }
  },
  {
    id: 2,
    headline: "новая коллекция",
    title: "ВЕСНА-ЛЕТО 2024",
    image: "/images/hero/Frame 1984077837 (1).jpg",
    cta: {
      text: "Смотреть",
      link: "/collections/new-arrivals"
    }
  },
  {
    id: 3,
    headline: "только в этом месяце",
    title: "РАСПРОДАЖА",
    image: "/images/hero/девушка с коробкой 1.png",
    cta: {
      text: "Перейти",
      link: "/collections/bathroom"
    }
  },
  {
    id: 4,
    headline: "новая коллекция",
    title: "UGODO 2024",
    videoDesktop: "/video/banners/1-pc.mp4",
    videoMobile: "/video/banners/1-mobile.mp4",
    image: "/images/hero/доставка бирюза 2.png",
    textAlign: 'right',
    cta: {
      text: "Смотреть видео",
      link: "/collections/new-arrivals"
    }
  }
]

const Hero = () => {
  const autoplayDelay = 10000
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start' 
    },
    [
      Autoplay({ 
        delay: autoplayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
      })
    ]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  useEffect(() => {
    setIsClient(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index);
  }, [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)

    return () => {
      emblaApi.off('reInit', onInit)
      emblaApi.off('reInit', onSelect)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onInit, onSelect])

  return (
    <div className="w-full relative overflow-hidden embla max-w-[1415px] mx-auto" style={{ borderRadius: '48px', height: '433px' }}> 
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex"> 
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className="flex-[0_0_100%] min-w-0 relative" 
              style={{ height: '433px' }}
            >
              <div className="absolute inset-0 w-full h-full -z-10">
                {(slide.videoDesktop || slide.videoMobile) && isClient ? (
                  <div className="w-full h-full relative overflow-hidden">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      disablePictureInPicture
                      className="w-full h-full object-cover object-center"
                      style={{
                        minWidth: '100%',
                        minHeight: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center'
                      }}
                    >
                      <source src={isMobile ? slide.videoMobile : slide.videoDesktop} type="video/mp4" />
                    </video>
                  </div>
                ) : (
                  <Image 
                    src={slide.image} 
                    alt={slide.title}
                    fill
                    priority={slide.id === 1}
                    loading={slide.id === 1 ? "eager" : "lazy"}
                    className="object-cover object-center"
                    sizes="100vw"
                    quality={90}
                  />
                )}
              </div>
              
              <div className="absolute inset-0 z-0"></div>
              
              <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto pt-32 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8">
                  <div className={`max-w-md ${slide.textAlign === 'right' ? 'ml-auto' : ''}`}>
                    <Text className="text-white/90 text-lg md:text-xl mb-2 font-light tracking-wide">
                      {slide.headline}
                    </Text>
                    <Heading 
                      level="h1" 
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight tracking-tight"
                    >
                      {slide.title}
                    </Heading>
                    <LocalizedClientLink href={slide.cta.link}>
                      <Button 
                        className="bg-black hover:bg-gray-800 text-white min-w-32 h-12 px-6"
                        size="large"
                      >
                        {slide.cta.text}
                      </Button>
                    </LocalizedClientLink>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-1">
            {scrollSnaps.map((_, index) => (
              <div
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-200 
                  ${index === selectedIndex 
                    ? 'bg-black' 
                    : 'bg-white border border-black hover:bg-gray-300'}`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
