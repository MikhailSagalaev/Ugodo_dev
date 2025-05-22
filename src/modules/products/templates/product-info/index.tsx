'use client'

import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import Breadcrumbs, { BreadcrumbItem } from "@modules/common/components/breadcrumbs"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
  showHeader?: boolean
}

const ProductInfo = ({ product, showHeader = false }: ProductInfoProps) => {
  const pathname = usePathname()
  
  // Формируем хлебные крошки, если нужно отображать заголовок
  const breadcrumbItems: BreadcrumbItem[] = []
  
  if (showHeader && product.collection) {
    breadcrumbItems.push({
      name: product.collection.title,
      path: `/collections/${product.collection.handle}`
    })
  }
  
  if (showHeader) {
    breadcrumbItems.push({
      name: product.title,
      path: pathname
    })
  }

  return (
    <div id="product-info" className="w-full">
      {showHeader && (
        <>
          {/* Хлебные крошки */}
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          
          {/* Категория и отзывы */}
          <div className="flex flex-col small:flex-row small:items-center gap-4 mb-2">
            {product.collection && (
              <div className="uppercase text-xs tracking-widest font-medium" 
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "1.4px",
                  lineHeight: 1.5,
                  textTransform: "uppercase"
                }}>
                {product.collection.title}
              </div>
            )}
            
            {/* Отзывы */}
            <div className="flex items-center">
              <div className="flex items-center">
                <span className="text-lg mr-1">★★★★</span>
                <span className="text-lg mr-2">☆</span>
              </div>
              <span className="text-xs font-medium">• 6 отзывов</span>
            </div>
          </div>
          
          {/* Название продукта */}
          <h1 className="text-3xl small:text-5xl font-medium leading-tight tracking-tight mb-8"
              style={{
                fontSize: "50px",
                fontWeight: 500,
                letterSpacing: "-0.2px",
                lineHeight: 1.1
              }}>
            {product.title}
          </h1>
        </>
      )}
      
      {/* Описание продукта (отображается только если не показываем заголовок) */}
      {!showHeader && product.description && (
        <Text
          className="text-medium text-ui-fg-subtle whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      )}
    </div>
  )
}

export default ProductInfo
