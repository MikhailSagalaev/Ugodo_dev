import { Text } from "@medusajs/ui"

type FeatureItem = {
  icon: string
  title: string
  description: string
}

type DeliveryFeaturesProps = {
  items?: FeatureItem[]
}

const defaultFeatures = [
  {
    icon: "🚚",
    title: "Экспресс доставка",
    description: "Получите заказ в течение 24 часов"
  },
  {
    icon: "🔄",
    title: "Простой возврат",
    description: "14 дней на возврат товара"
  },
  {
    icon: "🔒",
    title: "Безопасная оплата",
    description: "Защищенные платежи"
  }
]

const DeliveryFeatures = ({ items = defaultFeatures }: DeliveryFeaturesProps) => {
  return (
    <div className="content-container my-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {items.map((item, index) => (
          <div key={index} className="p-6 text-center border border-neutral-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow hover:border-neutral-300">
            <div className="text-violet-600 mb-3 text-xl">{item.icon}</div>
            <h3 className="text-lg font-medium mb-1">{item.title}</h3>
            <p className="text-sm text-neutral-600 mb-0">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeliveryFeatures 