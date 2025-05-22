'use client'

import React from 'react'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  name: string
  path: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumbs" className={`flex items-center text-[14px] text-black ${className}`}>
      <ol className="flex items-center flex-wrap">
        <li className="flex items-center">
          <LocalizedClientLink href="/" className="hover:text-gray-800 transition-colors duration-200">
            главная
          </LocalizedClientLink>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight size={12} className="mx-1" />
            {index === items.length - 1 ? (
              <span className="text-black">{item.name}</span>
            ) : (
              <LocalizedClientLink 
                href={item.path} 
                className="hover:text-gray-800 transition-colors duration-200"
              >
                {item.name}
              </LocalizedClientLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs 