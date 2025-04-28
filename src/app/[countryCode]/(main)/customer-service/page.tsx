import { Metadata } from "next"
import { Container, Heading, Text } from "@medusajs/ui"

export const metadata: Metadata = {
  title: "Служба поддержки",
  description: "Свяжитесь с нашей службой поддержки клиентов.",
}

export default function CustomerServicePage() {
  return (
    <Container className="py-12">
      <Heading level="h1" className="mb-6">
        Служба поддержки клиентов
      </Heading>
      <div className="flex flex-col gap-y-4">
        <Text>
          Если у вас возникли вопросы по поводу вашего заказа, наших товаров или вам нужна помощь, пожалуйста, свяжитесь с нами.
        </Text>
        <div>
          <Heading level="h3" className="mb-2">Контактная информация:</Heading>
          <ul className="list-disc list-inside">
            <li>Телефон: <a href="tel:+7XXXXXXXXXX" className="text-ui-fg-interactive hover:underline">+7 (XXX) XXX-XX-XX</a></li>
            <li>Email: <a href="mailto:support@example.com" className="text-ui-fg-interactive hover:underline">support@example.com</a></li>
          </ul>
        </div>
        <div>
          <Heading level="h3" className="mb-2">Часы работы:</Heading>
          <Text>Понедельник - Пятница: 9:00 - 18:00</Text>
          <Text>Суббота, Воскресенье: Выходной</Text>
        </div>
        <Text>
          Мы постараемся ответить на ваш запрос как можно скорее.
        </Text>
      </div>
    </Container>
  )
} 