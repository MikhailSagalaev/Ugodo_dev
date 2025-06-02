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
  
  if (showHeader) {
    // Добавляем категорию товара
    if (product.categories && product.categories.length > 0) {
      const category = product.categories[0]
      
      // Если есть родительская категория, добавляем её
      if (category.parent_category) {
        breadcrumbItems.push({
          name: category.parent_category.name,
          path: `/categories/${category.parent_category.handle}`
        })
      }
      
      // Добавляем саму категорию
      breadcrumbItems.push({
        name: category.name,
        path: `/categories/${category.handle}`
      })
    } else if (product.collection) {
      // Если нет категории, но есть коллекция
      breadcrumbItems.push({
        name: product.collection.title,
        path: `/collections/${product.collection.handle}`
      })
    }
    
    // Добавляем название товара
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
          
          {/* Тип товара */}
          <div className="flex flex-col small:flex-row small:items-center gap-4 mb-2">
            {product.type?.value && (
              <div className="uppercase text-xs tracking-widest font-medium text-[11px] font-medium leading-tight">
                {product.type.value}
              </div>
            )}
          </div>
          
          {/* Название продукта */}
          <h1 className="text-3xl small:text-5xl font-medium leading-tight tracking-tight mb-8 text-[50px] font-medium leading-tight">
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
