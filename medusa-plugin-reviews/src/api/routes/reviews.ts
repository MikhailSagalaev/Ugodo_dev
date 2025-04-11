import { Router } from "express"
import cors from "cors"
import { wrapHandler } from "@medusajs/medusa"
import { ReviewStatus } from "../../models/review"
import { validate } from "express-validator"
import { rateLimiter } from "../../middlewares/rate-limiter"

export default (container) => {
  const route = Router()

  const corsOptions = {
    origin: process.env.STORE_CORS.split(","),
    credentials: true
  }

  route.options("/store/reviews", cors(corsOptions))
  route.options("/store/reviews/:id", cors(corsOptions))
  route.options("/store/products/:id/reviews", cors(corsOptions))
  route.options("/store/products/:id/reviews/stats", cors(corsOptions))

  // Получить список отзывов
  route.get("/store/reviews", cors(corsOptions), wrapHandler(async (req, res) => {
    const reviewService = req.scope.resolve("reviewService")
    
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
    
    const reviews = await reviewService.list(selector, {
      order: { created_at: "DESC" },
      take: query.limit ? parseInt(query.limit as string) : 10,
      skip: query.offset ? parseInt(query.offset as string) : 0
    })
    
    res.json({ reviews })
  }))

  // Получить отзыв по ID
  route.get("/store/reviews/:id", cors(corsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve("reviewService")
    
    const review = await reviewService.retrieve(id)
    
    res.json({ review })
  }))

  // Создать новый отзыв
  route.post("/store/reviews", 
    validate(ReviewCreateSchema),
    rateLimiter(5, 60),
    cors(corsOptions),
    wrapHandler(createReviewHandler)
  )

  // Получить отзывы для конкретного товара
  route.get("/store/products/:id/reviews", cors(corsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve("reviewService")
    
    const reviews = await reviewService.list(
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

  // Получить статистику отзывов для товара
  route.get("/store/products/:id/reviews/stats", cors(corsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve("reviewService")
    
    const stats = await reviewService.getProductReviewStats(id)
    
    res.json(stats)
  }))

  // === Admin routes ===
  
  const adminCorsOptions = {
    origin: process.env.ADMIN_CORS.split(","),
    credentials: true
  }

  route.options("/admin/reviews", cors(adminCorsOptions))
  route.options("/admin/reviews/:id", cors(adminCorsOptions))
  route.options("/admin/reviews/:id/approve", cors(adminCorsOptions))
  route.options("/admin/reviews/:id/reject", cors(adminCorsOptions))

  // Админский route для получения всех отзывов
  route.get("/admin/reviews", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const reviewService = req.scope.resolve("reviewService")
    
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
    
    const reviews = await reviewService.list(selector, {
      order: { created_at: "DESC" },
      take: query.limit ? parseInt(query.limit as string) : 50,
      skip: query.offset ? parseInt(query.offset as string) : 0
    })
    
    res.json({ reviews })
  }))

  // Админский route для получения отзыва по ID
  route.get("/admin/reviews/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve("reviewService")
    
    const review = await reviewService.retrieve(id)
    
    res.json({ review })
  }))

  // Админский route для обновления отзыва
  route.put("/admin/reviews/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve("reviewService")
    
    const updated = await reviewService.update(id, req.body)
    
    res.json({ review: updated })
  }))

  // Админский route для одобрения отзыва
  route.post("/admin/reviews/:id/approve", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve("reviewService")
    
    const updated = await reviewService.update(id, { status: ReviewStatus.APPROVED })
    
    res.json({ review: updated })
  }))

  // Админский route для отклонения отзыва
  route.post("/admin/reviews/:id/reject", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve("reviewService")
    
    const updated = await reviewService.update(id, { status: ReviewStatus.REJECTED })
    
    res.json({ review: updated })
  }))

  // Админский route для удаления отзыва
  route.delete("/admin/reviews/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve("reviewService")
    
    await reviewService.delete(id)
    
    res.status(204).json({})
  }))

  return route
} 