"use client"

import { useState, useEffect } from "react"
import { Star, StarSolid } from "@medusajs/icons"
import { getProductReviews } from "@lib/data/reviews"

type ProductRatingProps = {
  productId: string
  showCount?: boolean
  size?: "sm" | "md" | "lg"
}

export default function ProductRating({ productId, showCount = false, size = "md" }: ProductRatingProps) {
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRating = async () => {
      try {
        const data = await getProductReviews({ productId, limit: 1 })
        setAverageRating(data.average_rating || 0)
        setReviewCount(data.count || 0)
      } catch (error) {
        console.error('Ошибка загрузки рейтинга:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRating()
  }, [productId])

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="animate-pulse flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="w-4 h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  const fullStars = Math.floor(averageRating)
  const hasHalfStar = averageRating % 1 >= 0.5

  const starSize = size === "sm" ? "14px" : size === "lg" ? "20px" : "16px"

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= fullStars ? (
              <StarSolid className="text-black" style={{ width: starSize, height: starSize }} />
            ) : star === fullStars + 1 && hasHalfStar ? (
              <StarSolid className="text-black" style={{ width: starSize, height: starSize }} />
            ) : (
              <Star className="text-gray-300" style={{ width: starSize, height: starSize }} />
            )}
          </span>
        ))}
      </div>
      {showCount && reviewCount > 0 && (
        <span className="text-xs font-medium">• {reviewCount} отзывов</span>
      )}
    </div>
  )
} 