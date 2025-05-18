import { MedusaService } from "@medusajs/framework/utils"
import Review from "./models/review"

class ReviewModuleService extends MedusaService({
  Review,
}) {
  // Здесь можно добавить кастомные методы для работы с отзывами

  // Получение статистики отзывов для продукта
  async getProductReviewStats(productId: string) {
    const reviews = await this.listReviews(
      { product_id: productId, status: "approved" },
      { skipSelect: false }
    )

    if (!reviews.length) {
      return {
        product_id: productId,
        average_rating: 0,
        rating_count: 0,
        ratings_distribution: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0
        }
      }
    }

    let sum = 0
    const ratingsDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    for (const review of reviews) {
      sum += review.rating
      const ratingKey = Math.floor(review.rating) as 1 | 2 | 3 | 4 | 5
      ratingsDistribution[ratingKey] += 1
    }

    return {
      product_id: productId,
      average_rating: sum / reviews.length,
      rating_count: reviews.length,
      ratings_distribution: ratingsDistribution
    }
  }

  /**
   * Массовое обновление отзывов
   * 
   * @param reviewIds - Массив ID отзывов для обновления
   * @param data - Данные для обновления
   * @returns Массив обновленных отзывов
   */
  async bulkUpdate(reviewIds: string[], data: Record<string, any>) {
    if (!reviewIds || !reviewIds.length) {
      return []
    }

    const results = []
    
    // Используем транзакцию для обеспечения атомарности операции
    const manager = this.getManager()
    const repository = manager.getRepository("review")
    
    await manager.transaction(async (transactionManager) => {
      for (const id of reviewIds) {
        const updated = await repository.update({ id }, data)
        if (updated) {
          const review = await repository.findOne({ id })
          results.push(review)
        }
      }
    })

    return results
  }
}

export default ReviewModuleService 