import React from 'react';
import { Text, Heading, Container } from "@medusajs/ui"
import { ArrowLongRight, ArrowUturnLeft, LockClosedSolid } from "@medusajs/icons"

type FeatureItem = {
  icon: string
  title: string
  description: string
}

type DeliveryFeaturesProps = {
  items?: FeatureItem[]
}

const defaultFeatures: FeatureItem[] = [
  {
    icon: "ArrowLongRight",
    title: "Быстрая доставка",
    description: "Доставим ваш заказ быстро и в удобное для вас время."
  },
  {
    icon: "ArrowUturnLeft",
    title: "Простой обмен",
    description: "Не подошел товар? Обменяем без лишних вопросов."
  },
  {
    icon: "LockClosedSolid",
    title: "Безопасная оплата",
    description: "Гарантируем безопасность ваших платежей."
  }
]

const IconMap: { [key: string]: React.ElementType } = {
  ArrowLongRight,
  ArrowUturnLeft,
  LockClosedSolid
};

const DeliveryFeatures = ({ items = defaultFeatures }: DeliveryFeaturesProps) => {
  return (
    <Container className="py-8 md:py-12 bg-neutral-50">
      <Heading level="h2" className="text-3xl font-bold text-center mb-8 md:mb-12">
        Почему выбирают Ugodo?
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {items.map((item, index) => {
          const FeatureIcon = IconMap[item.icon];
          return (
            <div key={index} className="p-6 text-center border border-neutral-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow hover:border-neutral-300">
              {FeatureIcon && <FeatureIcon className="w-10 h-10 text-[#cbf401] mx-auto mb-4" />}
              <Heading level="h3" className="text-lg font-semibold mb-2">
                {item.title}
              </Heading>
              <Text className="text-neutral-600 text-sm">
                {item.description}
              </Text>
            </div>
          )
        })}
      </div>
    </Container>
  )
}

export default DeliveryFeatures 