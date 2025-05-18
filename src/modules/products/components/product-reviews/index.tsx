"use client"

import { useState, useEffect, useCallback } from "react"
import { getProductReviews } from "@lib/data/reviews"
import { StoreProductReview } from "../../../../types/reviews"
import { Star, StarSolid } from "@medusajs/icons"
import { Button, Heading, Skeleton } from "@medusajs/ui"
import ProductReviewsForm from "./form"
import dayjs from 'dayjs'
import 'dayjs/locale/ru' // Импортируем русскую локаль
dayjs.locale('ru') // Устанавливаем русскую локаль

type ProductReviewsProps = {
  productId: string
}

// Компонент для отображения одного отзыва
function Review({ review }: { review: StoreProductReview }) {
  const reviewDate = dayjs(review.created_at).format('D MMMM YYYY') // Форматируем дату
  const authorName = `${review.first_name || ''} ${review.last_name || ''}`.trim() || 'Аноним'

  return (
    <div className="flex flex-col gap-y-2 text-base-regular text-ui-fg-base border-b border-ui-border-base pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-center">
        <div className="flex gap-x-1 items-center">
          {[1, 2, 3, 4, 5].map((rate) => (
            <span key={rate}>
              {rate <= review.rating ? (
                <StarSolid className="w-5 h-5 text-ui-tag-orange-icon" />
              ) : (
                <Star className="w-5 h-5 text-ui-fg-muted" />
              )}
            </span>
          ))}
        </div>
        <span className="text-gray-500 text-sm-regular">{reviewDate}</span>
      </div>
      {review.title && <Heading level="h3" className="text-md font-semibold mt-1">{review.title}</Heading>}
      <p className="text-md leading-relaxed mt-1">{review.content}</p>
      <p className="text-gray-600 text-sm-regular mt-2">{authorName}</p>
    </div>
  )
}

// Основной компонент
export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [page, setPage] = useState(1)
  const defaultLimit = 5 // Показывать по 5 отзывов за раз
  const [reviews, setReviews] = useState<StoreProductReview[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [hasMoreReviews, setHasMoreReviews] = useState(true) // Изначально предполагаем, что есть еще
  const [count, setCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Функция для загрузки отзывов
  const fetchReviews = useCallback((currentPage: number) => {
    setIsLoading(true)
    setError(null)
    getProductReviews({
      productId,
      limit: defaultLimit,
      offset: (currentPage - 1) * defaultLimit,
    }).then(({ reviews: paginatedReviews, average_rating, count, limit }) => {
      setReviews((prev) => {
        const existingIds = new Set(prev.map(r => r.id))
        const newReviews = paginatedReviews.filter(review => !existingIds.has(review.id));
        return currentPage === 1 ? paginatedReviews : [...prev, ...newReviews]
      })
      setAverageRating(average_rating) // API должен возвращать средний рейтинг
      setCount(count) // API должен возвращать общее количество
      setHasMoreReviews(count > currentPage * limit)
    }).catch(err => {
      console.error("Ошибка загрузки отзывов:", err)
      setError("Не удалось загрузить отзывы.")
      // Если ошибка на первой странице, обнуляем все
      if (currentPage === 1) {
         setReviews([])
         setAverageRating(0)
         setCount(0)
      }
      setHasMoreReviews(false) // Считаем, что больше нет
    }).finally(() => {
      setIsLoading(false)
    })
  }, [productId])

  // Загружаем первую страницу при монтировании
  useEffect(() => {
    fetchReviews(1)
  }, [fetchReviews])

  // Обработчик загрузки следующей страницы
  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchReviews(nextPage)
  }

  // Функция для перезагрузки отзывов (например, после отправки нового)
  const refreshReviews = useCallback(() => {
     setPage(1) // Сбрасываем на первую страницу
     setReviews([]) // Очищаем текущий список
     // Задержка перед перезагрузкой, чтобы дать время API обновиться
     setTimeout(() => fetchReviews(1), 300); 
  }, [fetchReviews])

  return (
    <div className="py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <Heading level="h2" className="text-2xl md:text-3xl font-semibold mb-4">
          Отзывы покупателей
        </Heading>
        {/* Показываем рейтинг только если он больше 0 и загрузка завершена */} 
        {!isLoading && count > 0 && (
          <div className="flex gap-x-2 justify-center items-center">
            <div className="flex gap-x-1">
              {[1, 2, 3, 4, 5].map((rate) => (
                <span key={rate}>
                  {rate <= Math.round(averageRating) ? (
                    <StarSolid className="w-6 h-6 text-ui-tag-orange-icon" />
                  ) : (
                    <Star className="w-6 h-6 text-ui-fg-muted" />
                  )}
                </span>
              ))}
            </div>
            <span className="text-base-regular text-gray-600">
              ({count} {count === 1 ? 'отзыв' : (count > 1 && count < 5) ? 'отзыва' : 'отзывов'}) - ср. {averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Отображение скелетона при загрузке */} 
      {isLoading && page === 1 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {[...Array(defaultLimit)].map((_, i) => (
              <div key={i} className="border-b border-ui-border-base pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0 animate-pulse">
                  <Skeleton className="w-24 h-5 mb-2 rounded" />
                  <Skeleton className="w-3/4 h-6 mb-3 rounded" />
                  <Skeleton className="w-full h-16 mb-3 rounded" />
                  <Skeleton className="w-1/3 h-4 rounded" />
              </div>
            ))}
          </div>
      )}
      
      {/* Отображение ошибки */} 
      {error && page === 1 && !isLoading && (
        <div className="text-center text-rose-500 bg-rose-50 p-4 rounded-md">{error}</div>
      )}
      
      {/* Отображение списка отзывов */} 
      {!isLoading && reviews.length === 0 && count === 0 && page === 1 && (
        <div className="text-center text-gray-500 py-8">Для этого товара пока нет отзывов.</div>
      )}

      {reviews.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {reviews.map((review) => (
            <Review key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Кнопка "Загрузить еще" */} 
      {hasMoreReviews && !isLoading && (
        <div className="flex justify-center mt-8">
          <Button variant="secondary" onClick={loadMore} isLoading={isLoading && page > 1}>
            {isLoading && page > 1 ? 'Загрузка...' : 'Загрузить еще отзывы'}
          </Button>
        </div>
      )}

      {/* Форма добавления отзыва */} 
      <ProductReviewsForm productId={productId} onReviewSubmitted={refreshReviews} />
    </div>
  )
} 