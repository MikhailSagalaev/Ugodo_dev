import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Новинки",
  description: "Ознакомьтесь с последними поступлениями в нашем магазине.",
}

export default function NewArrivalsPage() {
  return (
    <div className="content-container py-6">
      <h1 className="text-2xl-semi mb-4">Новинки</h1>
      <p>Здесь будут отображаться последние поступившие товары.</p>
      {/* TODO: Добавить компонент для отображения товаров */}
    </div>
  )
} 