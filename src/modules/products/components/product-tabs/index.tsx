"use client"

import React, { useState } from "react"
import Back from "@modules/common/icons/back"
import FastDelivery from "@modules/common/icons/fast-delivery"
import Refresh from "@modules/common/icons/refresh"
import { Text } from "@medusajs/ui"
import { HttpTypes } from "@medusajs/types"
import ProductReviews from "@modules/products/components/product-reviews"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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

// Описание и Характеристики
const ProductDetailsTab = ({ product }: ProductTabsProps) => {
  const { variants, weight, length, width, height, material, origin_country } = product;
  const sku = variants && variants[0]?.sku;

  // Формируем список характеристик для отображения
  const characteristics = [
    { label: "Артикул", value: sku },
    { label: "Вес", value: weight ? `${weight} г` : null },
    { label: "Материал", value: material },
    { label: "Страна происхождения", value: origin_country },
    { 
      label: "Габариты (ДxШxВ)", 
      value: length && width && height ? `${length}x${width}x${height} мм` : null 
    },
  ].filter(char => char.value != null && char.value !== ''); // Отображаем только заполненные характеристики

  return (
    <div className="text-base text-ui-fg-base py-8 space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2 text-ui-fg-base">Описание</h3>
        <p className="whitespace-pre-line">{product.description || "Описание отсутствует."}</p>
      </div>

      {characteristics.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-ui-fg-base">Характеристики</h3>
          <ul className="space-y-2">
            {characteristics.map((char) => (
              <li key={char.label} className="flex">
                <span className="w-1/3 text-ui-fg-subtle">{char.label}:</span>
                <span className="w-2/3">{char.value}</span>
              </li>
            ))}
          </ul>
        </div>
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

// Компонент для информации о доставке, оплате и возврате
const ShippingPaymentReturnTab = () => { // product не нужен, информация статична
  return (
    <div className="text-base text-ui-fg-base py-8 space-y-8">
      {/* Блок Доставка */}
      <div>
        <h3 className="text-xl font-semibold mb-3 text-ui-fg-base flex items-center">
          <FastDelivery className="w-6 h-6 mr-2 text-ui-fg-interactive" />
          Доставка
        </h3>
        <ul className="list-disc list-inside space-y-1 pl-2 text-ui-fg-subtle">
          <li>Быстрая доставка по вашему городу и всей России.</li>
          <li>Ориентировочные сроки доставки: 2-7 рабочих дней (в зависимости от региона).</li>
          <li>Стоимость доставки рассчитывается при оформлении заказа.</li>
          <li>Возможна бесплатная доставка при заказе на определенную сумму (уточняйте условия акции).</li>
        </ul>
      </div>

      {/* Блок Оплата */}
      <div>
        <h3 className="text-xl font-semibold mb-3 text-ui-fg-base flex items-center">
          {/* Иконка для оплаты, если есть */}
          {/* <CreditCardIcon className="w-6 h-6 mr-2 text-ui-fg-interactive" /> */}
          Оплата
        </h3>
        <ul className="list-disc list-inside space-y-1 pl-2 text-ui-fg-subtle">
          <li>Мы принимаем к оплате банковские карты: VISA, MasterCard, МИР.</li>
          <li>Все платежи проходят через защищенное соединение.</li>
          <li>Оплата при получении (наложенный платеж) доступна для некоторых регионов (уточняйте при оформлении).</li>
        </ul>
      </div>

      {/* Блок Возврат и Обмен */}
      <div>
        <h3 className="text-xl font-semibold mb-3 text-ui-fg-base flex items-center">
          <Refresh className="w-6 h-6 mr-2 text-ui-fg-interactive" />
          Возврат и Обмен
        </h3>
        <ul className="list-disc list-inside space-y-1 pl-2 text-ui-fg-subtle">
          <li>Вы можете вернуть или обменять товар в течение 14 дней с момента получения.</li>
          <li>Товар должен сохранить товарный вид, потребительские свойства и фабричные ярлыки.</li>
          <li>Для оформления возврата свяжитесь с нашей службой поддержки.</li>
        </ul>
      </div>
    </div>
  )
}

// Информация о бренде
const BrandTab = ({ product }: ProductTabsProps) => {
  const collection = product.collection

  if (!collection) {
    return (
      <div className="py-8 text-base text-ui-fg-subtle">
        Информация о бренде отсутствует.
      </div>
    )
  }

  const description = collection.metadata?.description as string | undefined
  const logoUrl = collection.metadata?.logo_url as string | undefined

  return (
    <div className="py-8 text-base text-ui-fg-base space-y-6">
      <LocalizedClientLink 
        href={`/collections/${collection.handle}`}
        className="hover:underline"
      >
        <h3 className="text-2xl font-semibold text-ui-fg-base hover:text-ui-fg-interactive">
          {collection.title}
        </h3>
      </LocalizedClientLink>

      {logoUrl && (
        <div className="mt-4">
          <img src={logoUrl} alt={`Логотип ${collection.title}`} className="max-h-20 max-w-xs object-contain" />
        </div>
      )}

      {description && (
        <div className="mt-4">
          <h4 className="text-lg font-medium text-ui-fg-base mb-1">О бренде:</h4>
          <p className="text-ui-fg-subtle whitespace-pre-line">
            {description}
          </p>
        </div>
      )}

      {!description && !logoUrl && (
         <p className="text-ui-fg-subtle italic">Более подробная информация о бренде пока не добавлена.</p>
      )}

      <div className="mt-6">
        <LocalizedClientLink 
          href={`/collections/${collection.handle}`}
          className="text-sm text-ui-fg-interactive hover:text-ui-fg-interactive-hover underline"
        >
          Посмотреть все товары бренда {collection.title}
        </LocalizedClientLink>
      </div>
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

// --- Компонент для таба "Отзывы" ---
const ReviewsTab = ({ product }: ProductTabsProps) => {
  return (
    <div className="py-4"> {/* Убрал лишний py-8, т.к. ProductReviews уже имеет свои отступы */}
      <ProductReviews productId={product.id} />
    </div>
  )
}

// --- Основной компонент ProductTabs с ручной реализацией --- 
const ProductTabs = ({ product }: ProductTabsProps) => {
  // Определяем вкладки и их компоненты
  const tabs = [
    {
      label: "Описание и характеристики", 
      component: <ProductDetailsTab product={product} />,
    },
    {
      label: "Отзывы",
      component: <ReviewsTab product={product} />,
    },
    {
      label: "Доставка, оплата и возврат",
      component: <ShippingPaymentReturnTab />,
    },
    {
      label: "Бренд",
      component: <BrandTab product={product} />,
    },
    // УДАЛЯЕМ ТАБ "Дополнительная информация"
    // {
    //   label: "Дополнительная информация",
    //   component: <AdditionalInfoTab />,
    // },
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
                ? "text-black border-b-2 border-ugodo"
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
