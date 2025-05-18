import { ArrowUpRightMini } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404",
  description: "Something went wrong",
}

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">404 - Страница не найдена</h1>
        <p className="text-gray-600 mb-6">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <a 
          href="/"
          className="py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors inline-block"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  )
}
