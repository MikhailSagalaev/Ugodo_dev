import { Heading, Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import React from "react"

// Используем HttpTypes.StoreProduct, чтобы иметь доступ ко всем полям, включая metadata
type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
  // 1. Извлекаем метаданные
  const metadata = product.metadata || {} // Если metadata undefined, используем пустой объект

  // 2. Фильтруем и форматируем метаданные для отображения
  const displayableMetadata = Object.entries(metadata)
    .filter(([key, value]) => {
      // Исключаем ключи, начинающиеся с '_', null/undefined значения, пустые строки, или строки только из '-'
      return !key.startsWith("_") && value !== null && value !== undefined && String(value).trim() !== "" && String(value).trim() !== "-";
    })
    .map(([key, value]) => ({
      id: key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      value: String(value),
    }));

  // 3. Определяем, что показывать: метаданные, описание или заглушку
  let contentToDisplay;

  if (displayableMetadata.length > 0) {
    contentToDisplay = (
      <div className="text-sm flex flex-col gap-y-2 mt-4" data-testid="product-metadata-attributes">
        {displayableMetadata.map((metaItem) => (
          <div key={metaItem.id} className="grid grid-cols-[auto_1fr] gap-x-3 items-baseline">
            <Text className="text-gray-700 font-medium">{metaItem.label}:</Text>
            <Text className="text-gray-800 text-left">{metaItem.value}</Text>
          </div>
        ))}
      </div>
    );
  } else if (product.description && product.description.trim() !== "") {
    contentToDisplay = (
      <Text
        className="text-medium text-ui-fg-subtle whitespace-pre-line mt-4"
        data-testid="product-description-fallback"
      >
        {product.description}
      </Text>
    );
  } else {
    contentToDisplay = (
      <Text className="text-sm text-gray-500 mt-4" data-testid="product-no-info">
        Подробная информация о товаре отсутствует.
      </Text>
    );
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

        {/* Вывод контента (метаданные, описание или заглушка) */}
        {contentToDisplay}
      </div>
    </div>
  )
}

export default ProductInfo 