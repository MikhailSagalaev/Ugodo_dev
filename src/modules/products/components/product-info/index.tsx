import { Heading, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import React from "react"

// Используем HttpTypes.StoreProduct, чтобы иметь доступ ко всем полям, включая metadata
type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  const metadata = product.metadata || {}

  const standardFields = []
  
  // Материал из поля material
  if (product.material && product.material.trim() !== "") {
    standardFields.push({
      id: "material",
      label: "Материал",
      value: product.material
    })
  }
  
  // Страна происхождения
  if (product.origin_country && product.origin_country.trim() !== "") {
    standardFields.push({
      id: "origin_country", 
      label: "Страна происхождения",
      value: product.origin_country
    })
  }

  // Размеры (если есть)
  if (product.weight) {
    standardFields.push({
      id: "weight",
      label: "Вес",
      value: `${product.weight} г`
    })
  }

  if (product.length || product.width || product.height) {
    const dimensions = []
    if (product.length) dimensions.push(`${product.length}`)
    if (product.width) dimensions.push(`${product.width}`)
    if (product.height) dimensions.push(`${product.height}`)
    
    standardFields.push({
      id: "dimensions",
      label: "Размеры",
      value: `${dimensions.join(' × ')} мм`
    })
  }

  // Обрабатываем метаданные (исключая служебные поля)
  const displayableMetadata = Object.entries(metadata)
    .filter(([key, value]) => {
      return !key.startsWith("_") && 
             value !== null && 
             value !== undefined && 
             String(value).trim() !== "" && 
             String(value).trim() !== "-"
    })
    .map(([key, value]) => ({
      id: key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      value: String(value),
    }))

  const allDisplayableFields = [...standardFields, ...displayableMetadata]

  // Определяем контент для табов
  const tabContent: Record<string, string> = {
    "ОПИСАНИЕ": product.description || "Описание товара отсутствует.",
    "СОСТАВ": product.material || "Информация о составе отсутствует.",
    "БРЕНД": "UGODO",
    "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ": product.subtitle || "Дополнительная информация отсутствует."
  }

  let contentToDisplay

  if (allDisplayableFields.length > 0) {
    contentToDisplay = (
      <div className="text-sm flex flex-col gap-y-2 mt-4" data-testid="product-info-attributes">
        {allDisplayableFields.map((field) => (
          <div key={field.id} className="grid grid-cols-[auto_1fr] gap-x-3 items-baseline">
            <Text className="text-gray-700 font-medium">{field.label}:</Text>
            <Text className="text-gray-800 text-left">{field.value}</Text>
          </div>
        ))}
      </div>
    )
  } else if (product.description && product.description.trim() !== "") {
    contentToDisplay = (
      <Text
        className="text-medium text-ui-fg-subtle whitespace-pre-line mt-4"
        data-testid="product-description-fallback"
      >
        {product.description}
      </Text>
    )
  } else {
    contentToDisplay = (
      <Text className="text-sm text-gray-500 mt-4" data-testid="product-no-info">
        Подробная информация о товаре отсутствует.
      </Text>
    )
  }

  return (
    <div id="product-info" className="w-full">
      <div className="flex flex-col gap-y-4 lg:max-w-[500px] mx-auto">
        {/* Название коллекции (если есть) */}
        {product.collection?.title && (
          <Text
            className="text-medium text-ui-fg-muted"
            data-testid="product-collection"
          >
            {product.collection.title}
          </Text>
        )}

        {/* Название товара */}
        <Heading
          level="h2"
          className="text-3xl leading-10 text-ui-fg-base"
          data-testid="product-title"
        >
          {product.title}
        </Heading>

        {/* SKU товара */}
        {(product.handle || product.id) && (
          <Text
            className="text-sm text-ui-fg-muted font-medium"
            data-testid="product-sku"
          >
            SKU: {product.handle || product.id}
          </Text>
        )}

        {/* Subtitle как дополнительная информация */}
        {product.subtitle && (
          <Text
            className="text-medium text-ui-fg-muted"
            data-testid="product-subtitle"
          >
            {product.subtitle}
          </Text>
        )}

        {/* Вывод контента */}
        {contentToDisplay}

        {/* Информация о вариантах (если есть опции) */}
        {product.options && product.options.length > 0 && (
          <div className="mt-4">
            <Text className="text-sm font-medium mb-2">Доступные варианты:</Text>
            {product.options.map((option) => (
              <div key={option.id} className="mb-2">
                <Text className="text-xs text-gray-600">{option.title}</Text>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo 