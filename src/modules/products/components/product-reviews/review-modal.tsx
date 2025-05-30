"use client"

import { useState, useEffect } from "react"
import { Star, StarSolid, X } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { createProductReviewAction } from "../../../../app/actions/reviews"
import { useActionState } from "react"
import { retrieveCustomer } from "@lib/data/customer"

type ReviewModalProps = {
  productId: string
  product?: HttpTypes.StoreProduct
  onClose: () => void
  onReviewSubmitted: () => void
}

type ActionResponse = {
  success: boolean
  message: string | null
  errors: any
  review: any
}

const initialState: ActionResponse = {
  success: false,
  message: null,
  errors: null,
  review: null,
}

const ratingLabels = {
  1: "очень плохо",
  2: "плохо", 
  3: "так себе",
  4: "хорошо",
  5: "отлично"
}

export default function ReviewModal({ productId, product, onClose, onReviewSubmitted }: ReviewModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [advantages, setAdvantages] = useState("")
  const [disadvantages, setDisadvantages] = useState("")
  const [comment, setComment] = useState("")
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [state, formAction] = useActionState(createProductReviewAction.bind(null, productId), initialState)

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const customerData = await retrieveCustomer()
        setCustomer(customerData)
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error)
      }
    }
    
    loadCustomer()
  }, [])

  useEffect(() => {
    if (state.success) {
      onReviewSubmitted()
      onClose()
    }
  }, [state.success, onReviewSubmitted, onClose])

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleSubmit = async (formData: FormData) => {
    // Формируем полный текст отзыва
    let fullContent = ""
    if (advantages.trim()) {
      fullContent += `Достоинства: ${advantages.trim()}\n\n`
    }
    if (disadvantages.trim()) {
      fullContent += `Недостатки: ${disadvantages.trim()}\n\n`
    }
    if (comment.trim()) {
      fullContent += `Комментарий: ${comment.trim()}\n\n`
    }
    if (wouldRecommend !== null) {
      fullContent += `Рекомендую друзьям: ${wouldRecommend ? 'Да' : 'Нет'}`
    }
    
    formData.append('rating', rating.toString())
    formData.append('title', advantages.trim() ? `Достоинства: ${advantages.trim().substring(0, 50)}...` : 'Отзыв')
    formData.append('content', fullContent)
    formData.append('first_name', customer?.first_name || 'Аноним')
    formData.append('last_name', customer?.last_name || '')
    
    await formAction(formData)
  }

  const canProceedStep2 = advantages.trim() || disadvantages.trim() || comment.trim()

  const steps = [
    { number: 1, title: "оценка продукта" },
    { number: 2, title: "ваше мнение" },
    { number: 3, title: "рекомендация" }
  ]

  return (
    <div className="fixed inset-0 bg-white z-50 flex">
      <div className="w-1/5 bg-white p-8 flex flex-col justify-center border-r border-gray-200">
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center gap-4">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep === step.number ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step.number}
              </div>
              <span 
                className={currentStep === step.number ? 'text-black' : 'text-[#7f7f7f]'}
                style={{
                  fontSize: "9px",
                  lineHeight: 1.5,
                  fontWeight: 500,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase"
                }}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full max-w-6xl px-8">
          {currentStep === 1 && (
            <div className="flex items-start gap-16">
              <div className="flex-1 flex flex-col">
                {product && (
                  <>
                    {product.images?.[0] && (
                      <img 
                        src={product.images[0].url} 
                        alt={product.title}
                        className="w-96 h-96 object-cover mb-6"
                      />
                    )}
                    <div>
                      <div 
                        className="text-gray-600 mb-2"
                        style={{
                          fontSize: "9px",
                          fontWeight: 500,
                          letterSpacing: "1.4px",
                          textTransform: "uppercase"
                        }}
                      >
                        количество: 1
                      </div>
                      <div 
                        className="text-gray-600 mb-2"
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          letterSpacing: "1.4px",
                          lineHeight: "150%",
                          textTransform: "uppercase"
                        }}
                      >
                        {product.collection?.title}
                      </div>
                      <h3 
                        className="font-medium"
                        style={{
                          fontSize: "20px"
                        }}
                      >
                        {product.title}
                      </h3>
                    </div>
                  </>
                )}
              </div>

              <div className="flex-1">
                <h2 
                  className="font-medium mb-4"
                  style={{
                    fontSize: "45px",
                    fontWeight: 500,
                    letterSpacing: "-.2px",
                    lineHeight: 1.1
                  }}
                >
                  оцените продукт
                </h2>
                <p 
                  className="mb-8"
                  style={{
                    color: "#000",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: 1.6
                  }}
                >
                  поставьте оценку
                </p>
                
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="flex-shrink-0"
                    style={{
                      fontSize: "80px",
                      lineHeight: 1.1,
                      color: rating > 0 ? "#000" : "#999",
                      fontWeight: 500
                    }}
                  >
                    {rating || 0}
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingClick(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="p-1 transition-colors"
                      >
                        {star <= (hoveredRating || rating) ? (
                          <StarSolid className="text-black" style={{ width: "30px", height: "30px" }} />
                        ) : (
                          <Star className="text-gray-300" style={{ width: "30px", height: "30px" }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {(rating > 0 || hoveredRating > 0) && (
                  <div className="flex items-center gap-4 mb-8">
                    <div style={{ width: "80px" }}></div>
                    <p className="text-xl">
                      {ratingLabels[(hoveredRating || rating) as keyof typeof ratingLabels]}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div style={{ width: "80px" }}></div>
                  <button 
                    onClick={handleNext}
                    disabled={rating === 0}
                    className="bg-black text-white px-8 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "1.4px",
                      textTransform: "uppercase"
                    }}
                  >
                    далее
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-medium mb-4">поделитесь мнением</h2>
                <p className="text-gray-600">расскажите о достоинствах и недостатках товара</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-3">достоинства</label>
                  <textarea
                    value={advantages}
                    onChange={(e) => setAdvantages(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 h-24 resize-none focus:outline-none focus:border-black"
                    placeholder="что вам понравилось в товаре?"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium mb-3">недостатки</label>
                  <textarea
                    value={disadvantages}
                    onChange={(e) => setDisadvantages(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 h-24 resize-none focus:outline-none focus:border-black"
                    placeholder="что можно улучшить?"
                  />
                </div>

                <div>
                  <label className="block text-lg font-medium mb-3">комментарий</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full border border-gray-300 px-4 py-3 h-32 resize-none focus:outline-none focus:border-black"
                    placeholder="дополнительные впечатления о товаре"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  onClick={handleBack}
                  className="border border-gray-300 px-8 py-3 hover:bg-gray-50 transition-colors"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "1.4px",
                    textTransform: "uppercase"
                  }}
                >
                  назад
                </button>
                <button 
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className="bg-black text-white px-8 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  style={{
                    fontSize: "11px",
                    fontWeight: 500,
                    letterSpacing: "1.4px",
                    textTransform: "uppercase"
                  }}
                >
                  далее
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-medium mb-4">последний вопрос</h2>
                <p className="text-gray-600 text-xl mb-8">порекомендовали бы вы этот товар друзьям?</p>
              </div>

              <div className="flex justify-center gap-8 mb-12">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wouldRecommend === true}
                    onChange={() => setWouldRecommend(true)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 border-black flex items-center justify-center mr-3 ${wouldRecommend === true ? 'bg-black' : 'bg-white'}`}>
                    {wouldRecommend === true && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xl">да</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wouldRecommend === false}
                    onChange={() => setWouldRecommend(false)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 border-2 border-black flex items-center justify-center mr-3 ${wouldRecommend === false ? 'bg-black' : 'bg-white'}`}>
                    {wouldRecommend === false && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xl">нет</span>
                </label>
              </div>

              {customer && (
                <div className="text-center mb-8">
                  <p className="text-gray-600">
                    Отзыв будет опубликован от имени: <span className="font-medium">{customer.first_name} {customer.last_name}</span>
                  </p>
                </div>
              )}

              {state.message && (
                <div className={`p-4 rounded mb-6 ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {state.message}
                </div>
              )}

              <form action={handleSubmit}>
                <div className="flex gap-4 justify-center">
                  <button 
                    type="button"
                    onClick={handleBack}
                    className="border border-gray-300 px-8 py-3 hover:bg-gray-50 transition-colors"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "1.4px",
                      textTransform: "uppercase"
                    }}
                  >
                    назад
                  </button>
                  <button 
                    type="submit"
                    disabled={wouldRecommend === null}
                    className="bg-black text-white px-8 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "1.4px",
                      textTransform: "uppercase"
                    }}
                  >
                    отправить отзыв
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 