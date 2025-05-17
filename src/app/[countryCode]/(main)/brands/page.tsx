/**
 * @file: src/app/[countryCode]/(main)/brands/page.tsx
 * @description: Страница для отображения списка всех брендов (коллекций).
 * @dependencies: next, react, @lib/data/collections, @modules/common/components/localized-client-link, @medusajs/types, @medusajs/ui
 * @created: 2024-07-26 (Примерная дата, заменить на актуальную при необходимости)
 */

import { Metadata } from "next"
import { Suspense } from "react"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"

export const metadata: Metadata = {
  title: "Бренды",
  description: "Ознакомьтесь с нашими брендами.",
}

async function fetchCollections() {
  // Добавляем обработку ошибок и возвращаем пустой массив в случае неудачи
  try {
    const { collections } = await listCollections({ fields: "id,title,handle" })
    return collections
  } catch (error) {
    console.error("Ошибка при загрузке коллекций:", error)
    return []
  }
}

// Компонент для отображения списка брендов (коллекций)
const BrandList = ({ collections }: { collections: HttpTypes.StoreCollection[] }) => {
  if (!collections || collections.length === 0) {
    return <p>Бренды не найдены.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {collections.map((collection) => (
        <LocalizedClientLink
          key={collection.id}
          href={`/collections/${collection.handle}`}
          className="block p-4 border rounded-md hover:shadow-md transition-shadow text-center"
        >
          <Heading level="h3" className="text-lg font-semibold">
            {collection.title}
          </Heading>
          {/* Можно добавить изображение бренда, если оно есть в данных коллекции */}
          {/* collection.thumbnail ? <Image src={collection.thumbnail} alt={collection.title} width={100} height={100} /> : null */}
        </LocalizedClientLink>
      ))}
    </div>
  )
}

export default async function BrandsPage({
  params,
}: {
  params: { countryCode: string }
}) {
  const collections = await fetchCollections()

  return (
    <div className="content-container py-6">
      <Heading level="h1" className="text-2xl font-bold mb-8 text-center">
        Все бренды
      </Heading>
      <Suspense fallback={<p>Загрузка брендов...</p>}>
        <BrandList collections={collections} />
      </Suspense>
    </div>
  )
} 