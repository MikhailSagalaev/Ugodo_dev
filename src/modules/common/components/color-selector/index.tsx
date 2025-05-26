"use client"

import React, { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

type ColorSelectorProps = {
  product: HttpTypes.StoreProduct
  selectedOptions: Record<string, string>
  onOptionChange: (optionId: string, value: string) => void
}

const getColorStyle = (value: string): React.CSSProperties => {
  const lowerValue = value.toLowerCase();
  const colorMap: Record<string, string> = {
    'черный': '#000000',
    'белый': '#FFFFFF', 
    'красный': '#FF0000',
    'зеленый': '#008000',
    'синий': '#0000FF',
    'желтый': '#FFFF00',
    'оранжевый': '#FFA500',
    'фиолетовый': '#800080',
    'розовый': '#FFC0CB',
    'серый': '#808080',
    'коричневый': '#A52A2A',
    'голубой': '#00BFFF',
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'gray': '#808080',
    'grey': '#808080',
    'brown': '#A52A2A',
    'cyan': '#00FFFF',
    '21 light beige': '#F5E6D3',
    '23 natural beige': '#E8D5C4',
  };
  
  const color = colorMap[lowerValue] || value;
  
  if (lowerValue === 'белый' || lowerValue === 'white') {
    return { backgroundColor: color, border: '1px solid #e5e7eb' };
  }
  
  return { backgroundColor: color };
};

const ColorSelector: React.FC<ColorSelectorProps> = ({
  product,
  selectedOptions,
  onOptionChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const colorOption = product.options?.find(option => 
    option.title.toLowerCase().includes('цвет') || 
    option.title.toLowerCase().includes('color')
  )
  
  if (!colorOption || !colorOption.values || colorOption.values.length === 0) {
    return null
  }
  
  const selectedValue = selectedOptions[colorOption.id] || colorOption.values[0]?.value || ''
  const selectedColor = colorOption.values.find(v => v.value === selectedValue)
  
  return (
    <div className="relative" style={{ width: isMobile ? "100%" : "360px" }}>
      <div 
        className="border-b border-gray-300 pb-3"
        style={{ width: isMobile ? "100%" : "360px", height: "50px" }}
      >
        <div className="flex items-center h-full">
          <div className="relative flex-1">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-between w-full bg-white transition-colors duration-200 hover:text-[#C2E7DA]"
            >
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 mr-3"
                  style={getColorStyle(selectedValue)}
                />
                <span 
                  className="transition-colors duration-200"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "1.4px",
                    lineHeight: 1.5,
                    textTransform: "uppercase"
                  }}
                >
                  {selectedColor?.value || 'Выберите цвет'}
                </span>
              </div>
              <svg 
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 border-t-0 z-50 max-h-48 overflow-y-auto">
                {colorOption.values.map((colorValue) => (
                  <button
                    key={colorValue.value}
                    onClick={() => {
                      onOptionChange(colorOption.id, colorValue.value)
                      setIsOpen(false)
                    }}
                    className="flex items-center w-full px-4 py-2 hover:bg-gray-50 text-left transition-colors duration-200 hover:text-[#C2E7DA]"
                  >
                    <div 
                      className="w-4 h-4 mr-3"
                      style={getColorStyle(colorValue.value)}
                    />
                    <span 
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        letterSpacing: "1.4px",
                        lineHeight: 1.5,
                        textTransform: "uppercase"
                      }}
                    >
                      {colorValue.value}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ColorSelector 