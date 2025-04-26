"use client"

import { useState, useEffect } from "react"
import { retrieveCustomer } from "@lib/data/customer"
import { addProductReview } from "@lib/data/products" // Предполагаем, что эта функция будет создана
import { HttpTypes } from "@medusajs/types"
import { Button, Input, Label, Textarea, toast, Toaster, Heading } from "@medusajs/ui"
import { Star, StarSolid } from "@medusajs/icons"

type ProductReviewsFormProps = {
  productId: string
  onReviewSubmitted: () => void // Callback для обновления списка после отправки
}

export default function ProductReviewsForm({ productId, onReviewSubmitted }: ProductReviewsFormProps) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [rating, setRating] = useState(0)

  useEffect(() => {
    // Получаем данные пользователя при монтировании
    retrieveCustomer().then(setCustomer).catch(() => setCustomer(null)) // Обрабатываем случай неавторизованного пользователя
  }, [])

  // Функция для установки рейтинга
  const handleSetRating = (rate: number) => {
    // Позволяет снять оценку, если кликнуть на ту же звезду
    setRating(rating === rate ? 0 : rate)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!content || rating === 0) {
      toast.error("Ошибка", {
        description: "Пожалуйста, поставьте оценку и напишите текст отзыва.",
      })
      return
    }

    setIsLoading(true)
    addProductReview({
      product_id: productId,
      customer_id: customer?.id, // Передаем ID пользователя, если он есть
      rating,
      title: title || undefined, // title необязательный
      content,
      // Плагин может ожидать имя/фамилию, но лучше получать их на бэкенде по customer_id
      // first_name: customer?.first_name || "",
      // last_name: customer?.last_name || "",
    }).then(() => {
      setShowForm(false)
      setTitle("")
      setContent("")
      setRating(0)
      toast.success("Спасибо!", {
        description: "Ваш отзыв отправлен на модерацию.",
      })
      onReviewSubmitted() // Вызываем callback для обновления списка
    }).catch((err) => {
      console.error("Ошибка отправки отзыва:", err);
      toast.error("Ошибка", {
        description: "Не удалось отправить отзыв. Попробуйте позже.",
      })
    }).finally(() => {
      setIsLoading(false)
    })
  }

  // Не показываем кнопку/форму, если пользователь не авторизован
  if (!customer) {
    return null // Или можно показать сообщение "Войдите, чтобы оставить отзыв"
  }

  return (
    <div className="mt-12">
      {!showForm && (
        <div className="flex justify-center">
          <Button onClick={() => setShowForm(true)}>Оставить отзыв</Button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-4 border-t border-ui-border-base pt-8">
           <Toaster /> {/* Добавляем Toaster для уведомлений */}
           <Heading level="h3" className="text-xlarge-semi">Написать отзыв</Heading>
           
           {/* Рейтинг */}
           <div>
             <Label htmlFor="rating" className="mb-2 block">Оценка <span className="text-rose-500">*</span></Label>
             <div className="flex gap-x-1">
               {[1, 2, 3, 4, 5].map((rate) => (
                 <button
                   type="button"
                   key={rate}
                   onClick={() => handleSetRating(rate)}
                   className="text-ui-fg-subtle focus:outline-none"
                   aria-label={`Оценить ${rate} из 5`}
                 >
                   {rate <= rating ? (
                     <StarSolid className="w-6 h-6 text-ui-tag-orange-icon" />
                   ) : (
                     <Star className="w-6 h-6" />
                   )}
                 </button>
               ))}
             </div>
           </div>

           {/* Заголовок */}
           <div>
             <Label htmlFor="title" className="mb-2 block">Заголовок (необязательно)</Label>
             <Input
               id="title"
               name="title"
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               placeholder="Кратко о главном"
               autoComplete="off"
             />
           </div>

           {/* Текст отзыва */}
           <div>
             <Label htmlFor="content" className="mb-2 block">Отзыв <span className="text-rose-500">*</span></Label>
             <Textarea
               id="content"
               name="content"
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Поделитесь вашим мнением о товаре..."
               rows={4}
               required
             />
           </div>

           {/* Кнопки */}
           <div className="flex justify-end gap-x-4 mt-4">
             <Button 
               variant="secondary" 
               type="button" 
               onClick={() => setShowForm(false)}
               disabled={isLoading}
             >
               Отмена
             </Button>
             <Button 
               type="submit" 
               isLoading={isLoading}
               disabled={rating === 0 || !content.trim()} // Блокируем, если нет оценки или текста
             >
               Отправить отзыв
             </Button>
           </div>
        </form>
      )}
    </div>
  )
} 