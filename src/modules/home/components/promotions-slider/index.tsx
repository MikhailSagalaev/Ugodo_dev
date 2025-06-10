'use client'

import React, { useState, useEffect } from 'react'
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading, Text } from '@medusajs/ui'
import Image from 'next/image'

const promotionBanners = [
  {
    id: 1,
    imageDesktop: "/images/banners/banner.png",
    imageMobile: "/images/banners/banner.png",
    alt: "Акция 1",
    link: "/collections/sale"
  },
  {
    id: 2,
    imageDesktop: "/images/banners/banner2.png",
    imageMobile: "/images/banners/banner2.png",
    alt: "Акция 2",
    link: "/collections/new-arrivals"
  },
  {
    id: 3,
    videoDesktop: "/video/banners/3-pc.mp4",
    videoMobile: "/video/banners/3-mobile.mp4",
    alt: "Техника для Дома",
    link: "/collections/electronics"
  }
]

const PromotionsSlider = () => {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div style={{ backgroundColor: '#f3f4f6' }}>
      <section style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <div className="content-container px-0 sm:px-4 md:px-8 relative" style={{ backgroundColor: '#f8f9fa', borderRadius: '32px', paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="mb-8 px-4 sm:px-0">
            <Heading level="h2" className="text-2xl md:text-3xl font-bold uppercase">АКЦИИ И ПРЕДЛОЖЕНИЯ</Heading>
          </div>

          <div className="flex gap-6 px-4 sm:px-0">
            {promotionBanners.map((banner, index) => (
              <div 
                key={banner.id} 
                className="a5cn_48 cna4_48"
                style={{
                  width: 'calc(33.33333% - 16px)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  flexGrow: 1,
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <LocalizedClientLink href={banner.link} className="relative block overflow-hidden group h-full">
                  <div className="relative w-full h-[200px]">
                    {isClient && (
                      <div className="w-full h-full relative overflow-hidden">
                        {banner.imageDesktop ? (
                          <Image
                            src={isMobile ? banner.imageMobile : banner.imageDesktop}
                            alt={banner.alt}
                            fill
                            className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-in-out"
                          />
                        ) : (
                          <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            disablePictureInPicture
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-in-out"
                            style={{
                              minWidth: '100%',
                              minHeight: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center center'
                            }}
                          >
                            <source src={isMobile ? banner.videoMobile : banner.videoDesktop} type="video/mp4" />
                          </video>
                        )}
                      </div>
                    )}

                  </div>
                </LocalizedClientLink>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default PromotionsSlider 