import { Heading, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import React from "react"

// Используем HttpTypes.StoreProduct, чтобы иметь доступ ко всем полям, включая metadata
type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  // Преобразуем метаданные в массив характеристик для отображения
  const getProductAttributes = () => {
    if (!product.metadata) return []

    return Object.entries(product.metadata)
      .filter(([key, value]) => {
        // Пропускаем служебные поля (начинающиеся с _) и пустые значения
        return !key.startsWith("_") && 
               value !== null && 
               value !== undefined && 
               String(value).trim() !== "" && 
               String(value).trim() !== "-";
      })
      .map(([key, value]) => ({
        key,
        label: key
          .split("_")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        value: String(value)
      }));
  };

  const attributes = getProductAttributes();
  const hasAttributes = attributes.length > 0;

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

        {/* Описание товара */}
        {product.description && (
          <Text
            className="text-medium text-ui-fg-subtle whitespace-pre-line"
            data-testid="product-description"
          >
            {product.description}
          </Text>
        )}

        {/* Характеристики товара из метаданных */}
        {hasAttributes && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <Text className="font-semibold mb-4 text-lg">Характеристики:</Text>
            <div className="grid gap-y-3">
              {attributes.map((attr) => (
                <div key={attr.key} className="grid grid-cols-[1fr_2fr] gap-x-4">
                  <Text className="text-gray-700 font-medium">{attr.label}:</Text>
                  <Text className="text-gray-900">{attr.value}</Text>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfo 