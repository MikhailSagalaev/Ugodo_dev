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
    <div className="text-base py-8"> { /* Увеличим шрифт для характеристик */}
      <div className="grid grid-cols-2 gap-x-8">
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Material</span>
            <p>{product.material ? product.material : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Country of origin</span>
            <p>{product.origin_country ? product.origin_country : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Type</span>
            <p>{product.type ? product.type.value : "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-y-4">
          <div>
            <span className="font-semibold">Weight</span>
            <p>{product.weight ? `${product.weight} g` : "-"}</p>
          </div>
          <div>
            <span className="font-semibold">Dimensions</span>
            <p>
              {product.length && product.width && product.height
                ? `${product.length}L x ${product.width}W x ${product.height}H`
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Информация о доставке и возвратах
const ShippingInfoTab = () => {
  return (
    <div className="text-base py-8"> { /* Увеличим шрифт */}
      <div className="grid grid-cols-1 gap-y-8">
        <div className="flex items-start gap-x-2">
          <FastDelivery />
          <div>
            <span className="font-semibold">Fast delivery</span>
            <p className="max-w-sm">
              Your package will arrive in 3-5 business days at your pick up
              location or in the comfort of your home.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Refresh />
          <div>
            <span className="font-semibold">Simple exchanges</span>
            <p className="max-w-sm">
              Is the fit not quite right? No worries - we&apos;ll exchange your
              product for a new one.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-x-2">
          <Back />
          <div>
            <span className="font-semibold">Easy returns</span>
            <p className="max-w-sm">
              Just return your product and we&apos;ll refund your money. No
              questions asked – we&apos;ll do our best to make sure your return
              is hassle-free.
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
      {product.collection?.title 
        ? `Товар принадлежит бренду: ${product.collection.title}`
        : "Информация о бренде отсутствует."}
    </div>
  )
}

// Дополнительная информация (заглушка)
const AdditionalInfoTab = () => {
  return (
    <div className="py-8 text-base">
      Дополнительная информация пока отсутствует.
    </div>
  )
}

// --- Основной компонент ProductTabs с ручной реализацией --- 
const ProductTabs = ({ product }: ProductTabsProps) => {
  // Определяем вкладки и их компоненты
  const tabs = [
    {
      label: "Описание", // Используем динамическое описание
      component: <DescriptionTab product={product} />,
    },
    {
      label: "Характеристики", // Используем динамические характеристики
      component: <ProductInfoTab product={product} />,
    },
    {
      label: "Доставка и возврат", // Используем динамическую инфу о доставке
      component: <ShippingInfoTab />,
    },
    {
      label: "Бренд", // Используем динамический бренд
      component: <BrandTab product={product} />,
    },
    {
      label: "Дополнительная информация", // Заглушка
      component: <AdditionalInfoTab />,
    },
  ]

  const [activeTab, setActiveTab] = useState(tabs[0].label)

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
                : "text-gray-500 hover:text-gray-700"
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
