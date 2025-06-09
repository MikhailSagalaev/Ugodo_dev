'use client'

import { useState, useEffect } from "react"

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div 
        className="flex-1 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      <div className={`${isMobile ? 'w-full' : 'w-[520px]'} bg-white h-full flex flex-col`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="flex-1 flex flex-col" style={{ 
          paddingLeft: isMobile ? "20px" : "80px", 
          paddingRight: isMobile ? "20px" : "80px", 
          paddingTop: isMobile ? "60px" : "120px", 
          paddingBottom: isMobile ? "40px" : "60px" 
        }}>
          <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-medium mb-4`}>напишите нам</h2>
          
          <p className="text-gray-600 mb-8">
            Выберите мессенджер – мы ответим на ваши вопросы в онлайн-чате.
          </p>
          
          <div className="space-y-4 flex-1">
            <button className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 mr-4 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63" fill="#25D366"/>
                </svg>
              </div>
              <span className="font-medium">WhatsApp</span>
            </button>
            
            <button className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 mr-4 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.333-.373-.12L8.9 13.617l-2.97-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" fill="#0088cc"/>
                </svg>
              </div>
              <span className="font-medium">Telegram</span>
            </button>
          </div>
          
          <button 
            onClick={onClose}
            className="w-full bg-black text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 transition-colors uppercase mt-8"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "1.4px",
              lineHeight: 1.5
            }}
          >
            закрыть
          </button>
        </div>
      </div>
    </div>
  )
} 