'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import SupportModal from "../support-modal"

export default function SupportButton() {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <div className="fixed bottom-20 right-6 z-40">
        <div 
          className="cursor-pointer"
          onClick={() => setIsSupportModalOpen(true)}
        >
          <Image
            src="/images/logo/logo3.png"
            alt="Логотип"
            width={isMobile ? 64 : 106}
            height={isMobile ? 64 : 106}
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      <SupportModal 
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </>
  )
} 