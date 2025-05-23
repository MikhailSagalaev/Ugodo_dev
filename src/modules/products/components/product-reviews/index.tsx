"use client"

import { useState, useEffect } from "react"
import { StoreProductReview } from "../../../../types/reviews"
import { Star, StarSolid } from "@medusajs/icons"
import { Heading } from "@medusajs/ui"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ru'

dayjs.extend(relativeTime)
dayjs.locale('ru')

type ProductReviewsProps = {
  productId: string
}

const mockReviews: StoreProductReview[] = [
  {
    id: "mock-review-1",
    rating: 5,
    title: "Отличный продукт!",
    content: "Очень довольна покупкой! Качество превосходное, упаковка красивая. Рекомендую всем! Буду заказывать еще.",
    first_name: "Владена",
    last_name: "А.",
    customer_id: null,
    created_at: "2024-12-15T10:30:00Z"
  },
  {
    id: "mock-review-2", 
    rating: 5,
    title: null,
    content: "Хорошая пигментация, стойкие тени",
    first_name: "Анастасия",
    last_name: "К.",
    customer_id: null,
    created_at: "2024-11-20T14:20:00Z"
  },
  {
    id: "mock-review-3",
    rating: 5,
    title: null,
    content: "очень классные тени ❤️",
    first_name: "Майя",
    last_name: "Б.",
    customer_id: null,
    created_at: "2024-11-10T16:45:00Z"
  }
]

const mockStarStats = {
  5: 82,
  4: 9,
  3: 2,
  2: 7,
  1: 0
}

function Review({ review }: { review: StoreProductReview }) {
  const timeAgo = dayjs(review.created_at).fromNow()
  const authorName = `${review.first_name || ''} ${review.last_name || ''}`.trim() || 'Аноним'

  return (
    <div className="border-b border-gray-200 last:border-b-0" style={{ minHeight: "115px", paddingBottom: "40px", marginBottom: "40px" }}>
      <div className="flex items-center gap-3" style={{ marginBottom: "2px" }}>
        <span style={{ fontSize: "16px", lineHeight: 1.4 }}>{authorName}</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((rate) => (
            <span key={rate}>
              {rate <= review.rating ? (
                <StarSolid className="text-black" style={{ width: "14px", height: "14px" }} />
              ) : (
                <Star className="text-black" style={{ width: "14px", height: "14px" }} />
              )}
            </span>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: "2px" }}>
        <span className="text-[#7f7f7f]" style={{ fontSize: "13px", lineHeight: 1.1 }}>
          {timeAgo}
        </span>
      </div>
      
      <p style={{ fontSize: "14px", lineHeight: 1.6, margin: 0, paddingTop: "15px" }}>
        {review.content}
      </p>
    </div>
  )
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  const reviews = mockReviews
  const totalReviews = 46
  const averageRating = 4.7
  
  const fullStars = Math.floor(averageRating)
  const hasHalfStar = averageRating % 1 >= 0.5

  if (isLoading) {
    return (
      <div className="py-8 md:py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-8"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <Heading level="h2" className="text-2xl md:text-3xl font-bold uppercase">
          рейтинг и отзывы
        </Heading>
        
        <button 
          className="flex items-center gap-2 transition-colors duration-200 hover:text-[#C2E7DA] cursor-pointer"
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "1.4px",
            textTransform: "uppercase"
          }}
        >
          смотреть всё
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="transition-colors duration-200">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex items-start justify-center gap-8 mb-8">
        <div style={{ maxHeight: "49px", width: "170px" }}>
          <div className="flex items-start gap-2">
            <div style={{ 
              fontSize: "45px", 
              fontWeight: 500, 
              fontStyle: "italic", 
              lineHeight: 1.1
            }}>
              {averageRating}
            </div>
            <div className="flex items-end" style={{ height: "49px" }}>
              <div className="flex flex-col items-start">
                <div className="flex gap-1 items-center mb-1">
                  {[1, 2, 3, 4, 5].map((rate) => (
                    <span key={rate}>
                      {rate <= fullStars ? (
                        <StarSolid className="text-black" style={{ width: "15px", height: "15px" }} />
                      ) : rate === fullStars + 1 && hasHalfStar ? (
                        <StarSolid className="text-black" style={{ width: "15px", height: "15px" }} />
                      ) : (
                        <Star className="text-black" style={{ width: "15px", height: "15px" }} />
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  оценка товара
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxHeight: "49px", width: "170px" }}>
          <div className="flex items-start gap-2">
            <div style={{ 
              fontSize: "45px", 
              fontWeight: 500, 
              fontStyle: "italic", 
              lineHeight: 1.1
            }}>
              {totalReviews}
            </div>
            <div className="flex items-end" style={{ height: "49px" }}>
              <div style={{ fontSize: "14px", color: "#666" }}>
                отзывов
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex" style={{ gap: "80px" }}>
        <div className="flex-shrink-0" style={{ width: "300px" }}>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm w-2">{stars}</span>
                <svg width="11" height="11" viewBox="0 0 15 15" fill="currentColor" className="text-black flex-shrink-0">
                  <path d="M7.5 0L9.18 5.18H15L10.41 8.36L12.09 13.54L7.5 10.36L2.91 13.54L4.59 8.36L0 5.18H5.82L7.5 0Z"/>
                </svg>
                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                  <div 
                    className="bg-black h-2 rounded-full" 
                    style={{ width: `${mockStarStats[stars as keyof typeof mockStarStats]}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">
                  {mockStarStats[stars as keyof typeof mockStarStats]}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "760px", flex: 1 }}>
          <div className="space-y-0">
            {reviews.map((review) => (
              <Review key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>

      {false && (
        <div className="flex justify-center mt-8">
          <button 
            className="border border-gray-300 px-6 py-3 hover:bg-[#C2E7DA] transition-colors duration-200"
            style={{
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "1.4px",
              textTransform: "uppercase"
            }}
          >
            оценить продукт
          </button>
        </div>
      )}
    </div>
  )
} 