import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Блог",
  description: "Полезные статьи и новости.",
}

export default function BlogPage() {
  return (
    <div className="content-container py-6">
      <h1 className="text-2xl-semi mb-4">Блог</h1>
      <p>Здесь будут отображаться записи блога.</p>
      {/* TODO: Добавить компонент для отображения записей блога */}
    </div>
  )
} 