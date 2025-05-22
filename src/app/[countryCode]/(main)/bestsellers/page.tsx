import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Хиты продаж",
  description: "Самые популярные товары в нашем магазине.",
}

export default function BestsellersPage() {
  return (
    <div className="content-container py-6">
      <h1 className="text-2xl-semi mb-4">Хиты продаж</h1>
      <p>Здесь будут отображаться самые популярные товары.</p>
      {/* TODO: Добавить компонент для отображения товаров */}
    </div>
  )
} 