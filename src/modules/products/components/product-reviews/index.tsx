"use client"

import { useState, useEffect } from "react"
import { StoreProductReview } from "../../../../types/reviews"
import { Star, StarSolid } from "@medusajs/icons"
import { Heading } from "@medusajs/ui"
import { retrieveCustomer } from "@lib/data/customer"
import { getProductReviews } from "@lib/data/reviews"
import { HttpTypes } from "@medusajs/types"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/ru'
import ReviewModal from "./review-modal"

dayjs.extend(relativeTime)
dayjs.locale('ru')

type ProductReviewsProps = {
  productId: string
  product?: HttpTypes.StoreProduct
}

type ReviewStats = {
  [key: number]: number
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
      
      {review.title && (
        <h4 style={{ fontSize: "14px", lineHeight: 1.4, margin: "8px 0", fontWeight: 500 }}>
          {review.title}
        </h4>
      )}
      
      <p style={{ fontSize: "14px", lineHeight: 1.6, margin: 0, paddingTop: "15px" }}>
        {review.content}
      </p>
    </div>
  )
}

export default function ProductReviews({ productId, product }: ProductReviewsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [reviews, setReviews] = useState<StoreProductReview[]>([])
  const [totalReviews, setTotalReviews] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [reviewStats, setReviewStats] = useState<ReviewStats>({})
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    retrieveCustomer()
      .then(setCustomer)
      .catch(() => setCustomer(null))
  }, [])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const data = await getProductReviews({ productId, limit: 10 })
      setReviews(data.reviews || [])
      setTotalReviews(data.count || 0)
      setAverageRating(data.average_rating || 0)
      
      const stats: ReviewStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      data.reviews?.forEach(review => {
        stats[review.rating] = (stats[review.rating] || 0) + 1
      })
      
      const statsPercentage: ReviewStats = {}
      Object.keys(stats).forEach(rating => {
        const ratingNum = parseInt(rating)
        statsPercentage[ratingNum] = totalReviews > 0 ? Math.round((stats[ratingNum] / totalReviews) * 100) : 0
      })
      setReviewStats(statsPercentage)
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [productId])

  const handleReviewSubmitted = () => {
    loadReviews()
    setIsReviewModalOpen(false)
  }

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

  const hasReviews = reviews.length > 0

  return (
    <div className="py-8 md:py-12">
      {!isMobile && (
        <div className="flex items-center justify-between mb-8">
          <Heading level="h2" className="text-2xl md:text-3xl font-bold lowercase">
            рейтинг и отзывы
          </Heading>
          
          {hasReviews && (
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
          )}
        </div>
      )}

      {!hasReviews ? (
        <div className="text-center py-12">
          <p className="text-lg mb-6">Будьте первыми кто оставит отзыв</p>
          {customer ? (
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-200"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "1.4px",
                textTransform: "uppercase"
              }}
            >
              написать отзыв
            </button>
          ) : (
            <button 
              onClick={() => window.location.href = '/account/login'}
              className="border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-200"
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "1.4px",
                textTransform: "uppercase"
              }}
            >
              войти
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={`flex ${isMobile ? 'flex-col gap-6' : 'gap-8'} mb-8`}>
            <div style={{ width: isMobile ? "auto" : "170px" }}>
              <div className="flex flex-col items-start">
                <div style={{ 
                  fontSize: isMobile ? "55px" : "45px", 
                  fontWeight: 500, 
                  fontStyle: "italic", 
                  lineHeight: 1.1,
                  letterSpacing: isMobile ? "-0.2px" : "0",
                  marginBottom: "4px"
                }}>
                  {averageRating.toFixed(1)}
                </div>
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
            
            {!isMobile && (
              <div className="flex flex-col items-end flex-1">
                <div className="flex items-center" style={{ height: "55px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="flex items-center" style={{ height: "19px" }}>
                  <div style={{ 
                    fontSize: "16px", 
                    fontWeight: 500, 
                    fontStyle: "italic", 
                    lineHeight: 1.1
                  }}>
                    {totalReviews}
                  </div>
                </div>
                <div style={{ 
                  fontSize: "14px", 
                  color: "#666",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: 1.4,
                  whiteSpace: "nowrap"
                }}>
                  отзывов
                </div>
              </div>
            )}
          </div>

          <div className={`flex ${isMobile ? 'flex-col gap-6' : 'gap-8'}`}>
            <div className="flex-shrink-0" style={{ width: isMobile ? "100%" : "300px" }}>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-sm w-2">{stars}</span>
                    <svg width="11" height="11" viewBox="0 0 15 15" fill="currentColor" className="text-black flex-shrink-0">
                      <path d="M7.5 0L9.18 5.18H15L10.41 8.36L12.09 13.54L7.5 10.36L2.91 13.54L4.59 8.36L0 5.18H5.82L7.5 0Z"/>
                    </svg>
                    <div className="flex-1 bg-gray-200 rounded-full h-2" style={{ maxWidth: isMobile ? "none" : "200px" }}>
                      <div 
                        className="bg-black h-2 rounded-full" 
                        style={{ width: `${reviewStats[stars] || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">
                      {reviewStats[stars] || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ maxWidth: isMobile ? "100%" : "760px", flex: 1 }}>
              {isMobile ? (
                <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                  {reviews.map((review) => (
                    <div key={review.id} className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-4" style={{ width: "280px" }}>
                      <Review review={review} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {reviews.map((review) => (
                    <Review key={review.id} review={review} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center mt-8">
            {customer ? (
              <button 
                onClick={() => setIsReviewModalOpen(true)}
                className="border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-200"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase"
                }}
              >
                оценить продукт
              </button>
            ) : (
              <button 
                onClick={() => window.location.href = '/account/login'}
                className="border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-200"
                style={{
                  fontSize: "11px",
                  fontWeight: 500,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase"
                }}
              >
                войти
              </button>
            )}
          </div>
        </>
      )}

      {isReviewModalOpen && (
        <ReviewModal 
          productId={productId}
          product={product}
          onClose={() => setIsReviewModalOpen(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  )
} 