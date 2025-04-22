import { Router } from "express"
import cors from "cors"
import { wrapHandler } from "@medusajs/medusa"
import { ReviewStatus } from "../../../../modules/review/models/review"
import { REVIEW_MODULE } from "../../../../modules/review"

export default (app) => {
  const route = Router()
  app.use("/store/reviews", route)

  const corsOptions = {
    origin: process.env.STORE_CORS.split(","),
    credentials: true
  }

  // Настройка CORS
  route.options("/", cors(corsOptions))
  route.options("/:id", cors(corsOptions))
  route.options("/product/:id", cors(corsOptions))
  route.options("/product/:id/stats", cors(corsOptions))

  // Получить список отзывов
  route.get("/", cors(corsOptions), wrapHandler(async (req, res) => {
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

  // Получить отзыв по ID
  route.get("/:id", cors(corsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const review = await reviewService.retrieveReview(id)
    
    res.json({ review })
  }))

  // Создать новый отзыв
  route.post("/", cors(corsOptions), wrapHandler(async (req, res) => {
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const review = await reviewService.createReviews({
      ...req.body,
      status: ReviewStatus.PENDING, // Все новые отзывы начинают с "ожидание"
    })
    
    res.status(201).json({ review })
  }))

  // Получить отзывы для конкретного товара
  route.get("/product/:id", cors(corsOptions), wrapHandler(async (req, res) => {
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

  // Получить статистику отзывов для товара
  route.get("/product/:id/stats", cors(corsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const stats = await reviewService.getProductReviewStats(id)
    
    res.json(stats)
  }))

  return app
} 