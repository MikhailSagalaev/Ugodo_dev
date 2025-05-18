import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"
import type { RoutesConfig, MedusaCustomRequestHandler } from "@medusajs/medusa"

/**
 * @swagger
 * /admin/reviews/batch:
 *   post:
 *     summary: Массовое обновление отзывов
 *     description: Обновляет статус нескольких отзывов одновременно
 *     tags:
 *       - Reviews
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - review_ids
 *               - action
 *             properties:
 *               review_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Массив ID отзывов
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Действие - одобрить или отклонить отзывы
 *     responses:
 *       200:
 *         description: Успешно обновлены отзывы
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   description: Обновленные отзывы
 *                 count:
 *                   type: number
 *                   description: Количество обновленных отзывов
 *                 action:
 *                   type: string
 *                   description: Выполненное действие
 */
export const POST: MedusaCustomRequestHandler = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const { review_ids, action } = req.body

  if (!review_ids || !Array.isArray(review_ids) || !review_ids.length) {
    return res.status(400).json({ 
      message: "Необходимо предоставить массив ID отзывов" 
    })
  }

  if (!action || !['approve', 'reject'].includes(action)) {
    return res.status(400).json({ 
      message: "Необходимо указать действие (approve или reject)" 
    })
  }

  const reviewService = req.scope.resolve("reviewModuleService")
  
  // Определяем статус на основе действия
  const status = action === 'approve' ? 'approved' : 'rejected'
  
  // Используем метод bulkUpdate для массового обновления
  const results = await reviewService.bulkUpdate(review_ids, { status })
  
  res.status(200).json({
    reviews: results,
    count: results.length,
    action
  })
}

export const config: RoutesConfig = {
  isAdminRoute: true,
} 