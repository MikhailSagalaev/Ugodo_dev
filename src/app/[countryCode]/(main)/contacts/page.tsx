import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Контакты",
  description: "Свяжитесь с нами.",
}

export default function ContactsPage() {
  return (
    <div className="content-container py-6">
      <h1 className="text-2xl-semi mb-4">Контакты</h1>
      <p>Здесь будет отображаться контактная информация: телефон, email, адрес, карта проезда.</p>
      {/* TODO: Добавить компоненты для отображения контактной информации */}
    </div>
  )
} 