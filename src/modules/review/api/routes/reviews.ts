import { Router } from "express"
import cors from "cors"
import { wrapHandler } from "@medusajs/medusa"
import { ReviewStatus } from "../../models/review"
import { REVIEW_MODULE } from "../../index"

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API для работы с отзывами о товарах
 */

export default (container) => {
  const route = Router()

  const corsOptions = {
    origin: process.env.STORE_CORS.split(","),
    credentials: true
  }

  const adminCorsOptions = {
    origin: process.env.ADMIN_CORS.split(","),
    credentials: true
  }

  // Настройка CORS
  route.options("/store/reviews", cors(corsOptions))
  route.options("/store/reviews/:id", cors(corsOptions))
  route.options("/store/products/:id/reviews", cors(corsOptions))
  route.options("/store/products/:id/reviews/stats", cors(corsOptions))
  route.options("/admin/reviews", cors(adminCorsOptions))
  route.options("/admin/reviews/:id", cors(adminCorsOptions))
  route.options("/admin/reviews/:id/approve", cors(adminCorsOptions))
  route.options("/admin/reviews/:id/reject", cors(adminCorsOptions))

  // === Store routes ===

  /**
   * @swagger
   * /store/reviews:
   *   get:
   *     summary: Получение списка отзывов
   *     tags: [Reviews]
   *     parameters:
   *       - in: query
   *         name: product_id
   *         schema:
   *           type: string
   *         description: ID товара для фильтрации отзывов
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, approved, rejected]
   *         description: Статус отзывов
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Количество записей на странице
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Смещение для пагинации
   *     responses:
   *       200:
   *         description: Список отзывов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 reviews:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Review'
   */
  route.get("/store/reviews", cors(corsOptions), wrapHandler(async (req, res) => {
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const query = req.query
    const selector: any = {}
    
    if (query.product_id) {
      selector.product_id = query.product_id
    }
    
    if (query.status) {
      selector.status = query.status
    } else {
      // По умолчанию возвращаем только одобренные отзывы
      selector.status = ReviewStatus.APPROVED
    }
    
    const reviews = await reviewService.listReviews(selector, {
      order: { created_at: "DESC" },
      take: query.limit ? parseInt(query.limit as string) : 10,
      skip: query.offset ? parseInt(query.offset as string) : 0
    })
    
    res.json({ reviews })
  }))

  /**
   * @swagger
   * /store/reviews/{id}:
   *   get:
   *     summary: Получение отзыва по ID
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID отзыва
   *     responses:
   *       200:
   *         description: Данные отзыва
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 review:
   *                   $ref: '#/components/schemas/Review'
   */
  route.get("/store/reviews/:id", cors(corsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const review = await reviewService.retrieveReview(id)
    
    res.json({ review })
  }))

  /**
   * @swagger
   * /store/reviews:
   *   post:
   *     summary: Создание нового отзыва
   *     tags: [Reviews]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [product_id, first_name, last_name, content, rating]
   *             properties:
   *               title:
   *                 type: string
   *                 description: Заголовок отзыва
   *               content:
   *                 type: string
   *                 description: Текст отзыва
   *               rating:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 5
   *                 description: Рейтинг от 1 до 5
   *               first_name:
   *                 type: string
   *                 description: Имя автора отзыва
   *               last_name:
   *                 type: string
   *                 description: Фамилия автора отзыва
   *               product_id:
   *                 type: string
   *                 description: ID товара, для которого создается отзыв
   *               customer_id:
   *                 type: string
   *                 description: ID клиента (опционально)
   *     responses:
   *       201:
   *         description: Созданный отзыв
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 review:
   *                   $ref: '#/components/schemas/Review'
   */
  route.post("/store/reviews", cors(corsOptions), wrapHandler(async (req, res) => {
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const review = await reviewService.createReviews({
      ...req.body,
      status: ReviewStatus.PENDING, // Все новые отзывы начинают с "ожидание"
    })
    
    res.status(201).json({ review })
  }))

  /**
   * @swagger
   * /store/products/{id}/reviews:
   *   get:
   *     summary: Получение списка отзывов для товара
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID товара
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Количество записей на странице
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Смещение для пагинации
   *     responses:
   *       200:
   *         description: Список отзывов товара
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 reviews:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Review'
   */
  route.get("/store/products/:id/reviews", cors(corsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const reviews = await reviewService.listReviews(
      { 
        product_id: id,
        status: ReviewStatus.APPROVED
      },
      {
        order: { created_at: "DESC" },
        take: req.query.limit ? parseInt(req.query.limit as string) : 10,
        skip: req.query.offset ? parseInt(req.query.offset as string) : 0
      }
    )
    
    res.json({ reviews })
  }))

  /**
   * @swagger
   * /store/products/{id}/reviews/stats:
   *   get:
   *     summary: Получение статистики отзывов товара
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID товара
   *     responses:
   *       200:
   *         description: Статистика отзывов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 product_id:
   *                   type: string
   *                 average_rating:
   *                   type: number
   *                 rating_count:
   *                   type: integer
   *                 ratings_distribution:
   *                   type: object
   *                   properties:
   *                     1:
   *                       type: integer
   *                     2:
   *                       type: integer
   *                     3:
   *                       type: integer
   *                     4:
   *                       type: integer
   *                     5:
   *                       type: integer
   */
  route.get("/store/products/:id/reviews/stats", cors(corsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const stats = await reviewService.getProductReviewStats(id)
    
    res.json(stats)
  }))

  // === Admin routes ===

  /**
   * @swagger
   * /admin/reviews:
   *   get:
   *     summary: Получение списка отзывов (административный доступ)
   *     tags: [Reviews]
   *     parameters:
   *       - in: query
   *         name: product_id
   *         schema:
   *           type: string
   *         description: ID товара для фильтрации отзывов
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, approved, rejected]
   *         description: Статус отзывов
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Поисковый запрос
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Количество записей на странице
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: Смещение для пагинации
   *     responses:
   *       200:
   *         description: Список отзывов
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 reviews:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Review'
   */
  route.get("/admin/reviews", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const query = req.query
    const selector: any = {}
    
    if (query.product_id) {
      selector.product_id = query.product_id
    }
    
    if (query.status) {
      selector.status = query.status
    }
    
    if (query.q) {
      selector.q = query.q
    }
    
    const reviews = await reviewService.listReviews(selector, {
      order: { created_at: "DESC" },
      take: query.limit ? parseInt(query.limit as string) : 50,
      skip: query.offset ? parseInt(query.offset as string) : 0
    })
    
    res.json({ reviews })
  }))

  /**
   * @swagger
   * /admin/reviews/{id}:
   *   get:
   *     summary: Получение отзыва по ID (административный доступ)
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID отзыва
   *     responses:
   *       200:
   *         description: Данные отзыва
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 review:
   *                   $ref: '#/components/schemas/Review'
   */
  route.get("/admin/reviews/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const review = await reviewService.retrieveReview(id)
    
    res.json({ review })
  }))

  /**
   * @swagger
   * /admin/reviews/{id}:
   *   put:
   *     summary: Обновление отзыва (административный доступ)
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID отзыва
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               content:
   *                 type: string
   *               rating:
   *                 type: number
   *                 minimum: 1
   *                 maximum: 5
   *               first_name:
   *                 type: string
   *               last_name:
   *                 type: string
   *               status:
   *                 type: string
   *                 enum: [pending, approved, rejected]
   *     responses:
   *       200:
   *         description: Обновленный отзыв
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 review:
   *                   $ref: '#/components/schemas/Review'
   */
  route.put("/admin/reviews/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const updated = await reviewService.updateReview(id, req.body)
    
    res.json({ review: updated })
  }))

  /**
   * @swagger
   * /admin/reviews/{id}/approve:
   *   post:
   *     summary: Одобрение отзыва (административный доступ)
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID отзыва
   *     responses:
   *       200:
   *         description: Одобренный отзыв
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 review:
   *                   $ref: '#/components/schemas/Review'
   */
  route.post("/admin/reviews/:id/approve", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const updated = await reviewService.updateReview(id, { status: ReviewStatus.APPROVED })
    
    res.json({ review: updated })
  }))

  /**
   * @swagger
   * /admin/reviews/{id}/reject:
   *   post:
   *     summary: Отклонение отзыва (административный доступ)
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID отзыва
   *     responses:
   *       200:
   *         description: Отклоненный отзыв
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 review:
   *                   $ref: '#/components/schemas/Review'
   */
  route.post("/admin/reviews/:id/reject", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const updated = await reviewService.updateReview(id, { status: ReviewStatus.REJECTED })
    
    res.json({ review: updated })
  }))

  /**
   * @swagger
   * /admin/reviews/{id}:
   *   delete:
   *     summary: Удаление отзыва (административный доступ)
   *     tags: [Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID отзыва
   *     responses:
   *       204:
   *         description: Отзыв успешно удален
   */
  route.delete("/admin/reviews/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    await reviewService.deleteReview(id)
    
    res.status(204).json({})
  }))

  return route
} 