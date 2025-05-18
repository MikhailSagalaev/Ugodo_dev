import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Акции",
  description: "Текущие акции и специальные предложения.",
}

export default function PromotionsPage() {
  return (
    <div className="content-container py-6">
      <h1 className="text-2xl-semi mb-4">Акции</h1>
      <p>Здесь будут отображаться текущие акции и скидки.</p>
      {/* TODO: Добавить компонент для отображения акций */}
    </div>
  )
} 