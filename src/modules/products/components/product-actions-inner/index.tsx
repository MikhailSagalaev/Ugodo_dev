"use client"

import { HttpTypes } from "@medusajs/types"
import { Region } from "@medusajs/medusa"
import { Button } from "@medusajs/ui"
import { isEqual } from "lodash"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { useIntersection } from "@lib/hooks/use-in-view"
import { addToCart } from "@lib/data/cart"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import ProductPrice from "@modules/products/components/product-price"

// Типы пропсов теперь включают variant
type ProductActionsInnerProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion | Region
  variant?: HttpTypes.StoreProductVariant // Добавляем variant
}

export default function ProductActionsInner({
  product,
  region,
  variant,
}: ProductActionsInnerProps) {
  const [options, setOptions] = useState<Record<string, string>>({})
  const [isAdding, setIsAdding] = useState(false)

  const countryCode = useParams().countryCode as string

  // Добавляем проверку на null
  const variants = product.variants ?? []

  // Инициализация опций при первом рендере
  useEffect(() => {
    const optionObj: Record<string, string> = {}
    for (const option of product.options || []) {
      // Устанавливаем undefined как начальное значение
      Object.assign(optionObj, { [option.id]: undefined })
    }
    setOptions(optionObj)
  }, [product])

  // Выбранный вариант на основе опций
  const selectedVariant = useMemo(() => {
    // Если передан variant, используем его
    if (variant) return variant

    // Иначе ищем вариант по опциям
    // Исправляем тип variantRecord
    let variantRecord: Record<string, Record<string, string>> = {}

    // Добавляем проверку на null для variants
    for (const variant of variants) {
      if (!variant.options || !variant.id) continue

      const temp: Record<string, string> = {}
      for (const option of variant.options) {
        // Проверяем option_id перед использованием как индекс
        if (option.option_id) {
          temp[option.option_id] = option.value
        }
      }
      // Исправляем присваивание для variantRecord
      variantRecord[variant.id] = temp
    }

    for (const key in variantRecord) {
      // Сравниваем только определенные опции
      const currentOptions = Object.entries(options)
        .filter(([, value]) => value !== undefined)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        
      if (isEqual(variantRecord[key], currentOptions)) {
        // Добавляем проверку на null для variants
        return variants.find((v) => v.id === key)
      }
    }

    return undefined
  }, [options, variants, variant])

  // Обновление опции - эта функция больше не передается напрямую
  // const updateOptions = (update: Record<string, string>) => {
  //   setOptions({ ...options, ...update })
  // }

  // Проверка, можно ли купить товар
  const inStock = useMemo(() => {
    // Если выбран вариант, проверяем его наличие
    if (selectedVariant && typeof selectedVariant.inventory_quantity !== 'undefined') {
        return selectedVariant.inventory_quantity > 0;
    }
    // Если вариант не выбран (например, нет опций), проверяем наличие хотя бы у одного варианта
    // Добавляем проверку на null для variants
    if (!selectedVariant && variants.length === 1 && typeof (variants[0]?.inventory_quantity) !== 'undefined') {
        return (variants[0]?.inventory_quantity ?? 0) > 0;
    }
    // Если есть опции, но вариант не выбран, считаем, что товара нет в наличии (нужно выбрать опции)
    if (!selectedVariant && (product.options?.length ?? 0) > 0) {
        return false;
    }
    // Если нет опций и нет вариантов, или у вариантов нет информации о количестве
    return false; // Или какая-то другая логика по умолчанию
}, [selectedVariant, variants, product.options]);

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null
    setIsAdding(true)
    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode: countryCode,
    })
    setIsAdding(false)
  }

  return (
    <div className="flex flex-col gap-y-2" data-testid="product-actions">
      <div>
        {/* Добавляем проверку на null для product.variants */} 
        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-y-4">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    // Передаем лямбда-функцию с правильной сигнатурой
                    updateOption={(optionId, value) => { 
                      setOptions((prev) => ({ ...prev, [optionId]: value }))
                    }}
                    title={option.title}
                    data-testid="option-select"
                    disabled={!!variant || !inStock} // Отключаем, если вариант передан или товара нет
                    variant={selectedVariant} // Передаем выбранный вариант
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Передаем product, selectedVariant и region в ProductPrice */} 
      {/* Цена будет отображаться только если передан variant (из ProductDetailsClient) */} 
      {variant && <ProductPrice product={product} variant={selectedVariant} region={region} />}

      <Button
        onClick={handleAddToCart}
        disabled={!inStock || !selectedVariant || !!variant || isAdding}
        variant="primary"
        className="w-full h-10"
        isLoading={isAdding}
        data-testid="add-product-button"
      >
        {!inStock
          ? "Нет в наличии"
          : !selectedVariant
          ? "Выберите вариант"
          : "Добавить в корзину"}
      </Button>
    </div>
  )
} 