import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Бренды",
  description: "Все бренды, представленные в нашем магазине.",
}

export default function BrandsPage() {
  return (
    <div className="content-container py-6">
      <h1 className="text-2xl-semi mb-4">Бренды</h1>
      <p>Здесь будет отображаться список брендов.</p>
      {/* TODO: Добавить компонент для отображения брендов */}
    </div>
  )
} 