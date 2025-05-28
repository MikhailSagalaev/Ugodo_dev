"use client"

import React, { useState } from "react"
import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import { Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

// --- Компоненты для контента вкладок ---
// Описание и Артикул
const DescriptionTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-base text-gray-700 py-8">
      <p>{product.description || "Описание отсутствует."}</p>
      {product.variants && product.variants[0]?.sku && (
        <p className="mt-4 text-sm text-gray-500">Артикул: {product.variants[0].sku}</p>
      )}
    </div>
  )
}

// Информация о продукте (материал, размеры и т.д.)
const ProductInfoTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="text-base py-8">
      <Text className="text-gray-500">Вся информация о характеристиках представлена в основном описании товара (справа от галереи).</Text>
    </div>
  )
}

// Информация о доставке и возвратах
const ShippingInfoTab = () => {
  return (
    <div className="text-base py-8">
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Быстрая доставка</span>
            <p className="max-w-sm">
              Ваш заказ прибудет в течение 3-5 рабочих дней в пункт выдачи или на дом.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Простой обмен</span>
            <p className="max-w-sm">
              Не подошел размер или товар? Без проблем – обменяем на новый.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Легкий возврат</span>
            <p className="max-w-sm">
              Просто верните товар, и мы вернем вам деньги. Без лишних вопросов – мы сделаем все возможное, чтобы ваш возврат прошел без проблем.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Информация о бренде
const BrandTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="py-8 text-base">
      бренд угодо
    </div>
  )
}

// Дополнительная информация (заглушка)
const AdditionalInfoTab = () => {
  return (
    <div className="py-8 text-base">
      пока нет
    </div>
  )
}

// --- Основной компонент ProductTabs с ручной реализацией --- 
const ProductTabs = ({ product }: ProductTabsProps) => {
  // Определяем вкладки и их компоненты
  const tabs = [
    {
      label: "Описание", 
      component: <DescriptionTab product={product} />,
    },
    {
      label: "Доставка и возврат",
      component: <ShippingInfoTab />,
    },
    {
      label: "СОСТАВ", 
      component: (
        <div className="py-8 text-base">
          состава пока нет
        </div>
      ),
    },
    {
      label: "БРЕНД",
      component: <BrandTab product={product} />,
    },
    {
      label: "ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ",
      component: <AdditionalInfoTab />,
    },
  ]

  // Если табы пусты, не рендерим компонент
  if (tabs.length === 0) {
    return null;
  }

  const [activeTab, setActiveTab] = useState(tabs[0].label) // Устанавливаем первый доступный таб активным

  return (
    <div className="w-full">
      <div className="flex flex-wrap border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`px-6 py-3 text-base focus:outline-none transition-all duration-200 ${
              activeTab === tab.label
                ? "text-black border-b-2 border-yellow-400"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="py-8">
        {tabs.map((tab) => (
          <div key={tab.label} className={`${activeTab === tab.label ? 'block' : 'hidden'}`}>
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductTabs
