"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useActionState } from "react"
import { Button, Input, Textarea, clx, Label, Skeleton } from "@medusajs/ui"
import { Star, StarSolid } from "@medusajs/icons"
import { retrieveCustomer } from "@lib/data/customer"
import { Customer } from "@medusajs/medusa"
import { createProductReviewAction, ActionResponse } from "../../../../app/actions/reviews"

type ReviewFormValues = {
  title: string
  content: string
  rating: number
}

type ProductReviewsFormProps = {
  productId: string
  onReviewSubmitted: () => void
}

const initialState: ActionResponse = {
    success: false,
    message: null,
    errors: null,
    review: null,
};

export default function ProductReviewsForm({ productId, onReviewSubmitted }: ProductReviewsFormProps) {
  const [customer, setCustomer] = useState<Omit<Customer, "password_hash"> | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [rating, setRating] = useState<number>(0)
  const [state, formAction] = useActionState<ActionResponse, FormData>(createProductReviewAction.bind(null, productId), initialState)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const {
    register,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    defaultValues: {
      rating: 0,
    },
  })

  useEffect(() => {
    setIsLoadingAuth(true)
    retrieveCustomer()
      .then(setCustomer)
      .finally(() => setIsLoadingAuth(false))
  }, [])

  useEffect(() => {
    if (state.success) {
        setRating(0)
        setShowSuccessMessage(true)
        onReviewSubmitted()
        reset()
        const timer = setTimeout(() => setShowSuccessMessage(false), 5000)
        return () => clearTimeout(timer)
    }
    if (!state.success && state.message) {
        setShowSuccessMessage(false)
    }
  }, [state, reset, onReviewSubmitted])

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    setValue("rating", newRating, { shouldValidate: true })
  }

  if (isLoadingAuth) {
    return (
      <div className="mt-12 border-t border-ui-border-base pt-8">
        <Skeleton className="w-1/3 h-6 mb-4" />
        <Skeleton className="w-full h-10 mb-2" />
        <Skeleton className="w-full h-24 mb-4" />
        <Skeleton className="w-1/4 h-10" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="mt-8 text-center border-t border-ui-border-base pt-8">
        <p className="text-ui-fg-subtle mb-4">Чтобы оставить отзыв, пожалуйста, войдите в свой аккаунт.</p>
        <Button asChild variant="secondary">
          <a href="/account/login">Войти</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-12 border-t border-ui-border-base pt-8">
      <h3 className="text-xl-semi mb-1">Оставить отзыв</h3>
      <p className="text-ui-fg-subtle text-sm mb-4">Вы вошли как {customer.first_name} {customer.last_name}</p>
      <form action={formAction} className="flex flex-col gap-y-4">
        <input type="hidden" {...register("rating")} value={rating} />
        <div className="flex flex-col gap-y-1">
          <Label htmlFor="review-title">Заголовок (необязательно)</Label>
          <Input id="review-title" {...register("title")} />
        </div>
        <div className="flex flex-col gap-y-1">
          <Label htmlFor="review-content">Ваш отзыв <span className="text-rose-500">*</span></Label>
          <Textarea id="review-content" {...register("content", { required: "Текст отзыва обязателен" })} required 
            aria-invalid={!!errors.content || !!state.errors?.content}
          />
          {errors.content && <span className="text-rose-500 text-xs italic">{errors.content.message}</span>}
          {state.errors?.content && <span className="text-rose-500 text-xs italic">{state.errors.content.join(", ")}</span>}
        </div>

        <div className="flex flex-col gap-y-2">
          <span className={clx("text-ui-fg-subtle text-sm", { "text-rose-500": !!errors.rating || !!state.errors?.rating })}>
            Оценка <span className="text-rose-500">*</span>
          </span>
          <div className="flex gap-x-1">
            {[1, 2, 3, 4, 5].map((index) => {
              const starValue = index
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => handleRatingChange(starValue)}
                  className="text-ui-fg-muted cursor-pointer p-1"
                  aria-label={`Рейтинг ${starValue}`}
                  disabled={isSubmitting || state.success}
                >
                  {starValue <= rating ? (
                    <StarSolid className="text-ui-tag-orange-icon w-6 h-6" />
                  ) : (
                    <Star className="w-6 h-6" />
                  )}
                </button>
              )
            })}
          </div>
          {errors.rating && <span className="text-rose-500 text-xs italic">{errors.rating.message}</span>}
          {state.errors?.rating && <span className="text-rose-500 text-xs italic">{state.errors.rating.join(", ")}</span>}
        </div>

        {state.message && !state.success && <p className="text-rose-500 text-sm p-2 bg-rose-50 rounded">{state.message}</p>}
        {showSuccessMessage && <p className="text-green-500 text-sm p-2 bg-green-50 rounded">Спасибо! Ваш отзыв отправлен на модерацию.</p>}

        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isSubmitting}
          disabled={isSubmitting || state.success}
        >
          {state.success ? 'Отправлено' : isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
        </Button>
      </form>
    </div>
  )
} 