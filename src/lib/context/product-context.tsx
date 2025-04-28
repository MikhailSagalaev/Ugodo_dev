"use client"

import { PricedProduct } from "@medusajs/medusa/dist/types/pricing"
import React, { createContext, useContext, useEffect, useState } from "react"

import { ProductOption } from "@medusajs/medusa"
import { Variant } from "@medusajs/medusa"

// Интерфейс для опций, где ключ - id опции, значение - выбранное значение опции
interface Options {
  [key: string]: string
}

// Интерфейс для контекста продукта
export interface ProductContext {
  variant?: Variant // Текущий выбранный вариант
  options: Options // Выбранные значения опций
  updateOptions: (options: Options) => void // Функция для обновления выбранных опций
  product: PricedProduct // Данные продукта
}

// Создаем React Context
const ProductActionContext = createContext<ProductContext | null>(null)

// Props для провайдера контекста
interface ProductProviderProps {
  children?: React.ReactNode
  product: PricedProduct
}

// Компонент-провайдер контекста
export const ProductProvider = ({
  product,
  children,
}: ProductProviderProps) => {
  // Состояние для хранения выбранных опций
  const [options, setOptions] = useState<Options>({})
  // Состояние для хранения текущего выбранного варианта
  const [variant, setVariant] = useState<Variant | undefined>(undefined)

  // Инициализация опций при монтировании компонента или изменении продукта
  useEffect(() => {
    // Получаем опции продукта
    const productOptions = product.options || []
    // Создаем объект с опциями по умолчанию (первое значение каждой опции)
    const optionObj: Options = {}
    for (const option of productOptions) {
      Object.assign(optionObj, { [option.id]: undefined })
    }
    setOptions(optionObj)
  }, [product])

  // Обновление варианта при изменении выбранных опций
  useEffect(() => {
    let variantId: string | undefined = undefined

    // Перебираем варианты продукта
    for (const v of product.variants) {
      let match = true
      // Сравниваем опции варианта с выбранными опциями
      for (const option of v.options) {
        if (option.value !== options[option.option_id]) {
          match = false
        }
      }

      // Если все опции совпали, это наш вариант
      if (match) {
        variantId = v.id
      }
    }

    // Находим и устанавливаем вариант по ID
    const variant = product.variants.find((v) => v.id === variantId)
    setVariant(variant)

  }, [options, product.variants])

  // Функция для обновления выбранных опций
  const updateOptions = (newOptions: Options) => {
    setOptions({ ...options, ...newOptions })
  }

  return (
    // Передаем значения контекста дочерним компонентам
    <ProductActionContext.Provider
      value={{
        options,
        updateOptions,
        variant,
        product,
      }}
    >
      {children}
    </ProductActionContext.Provider>
  )
}

// Хук для использования контекста продукта
export const useProduct = () => {
  const context = useContext(ProductActionContext)
  if (context === null) {
    throw new Error("useProduct must be used within a ProductProvider")
  }
  return context
} 