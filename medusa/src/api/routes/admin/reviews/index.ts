import { Router } from "express"
import cors from "cors"
import { wrapHandler } from "@medusajs/medusa"
import { ReviewStatus } from "../../../../modules/review/models/review"
import { REVIEW_MODULE } from "../../../../modules/review"

export default (app) => {
  const route = Router()
  app.use("/admin/reviews", route)

  const adminCorsOptions = {
    origin: process.env.ADMIN_CORS.split(","),
    credentials: true
  }

  // Настройка CORS
  route.options("/", cors(adminCorsOptions))
  route.options("/:id", cors(adminCorsOptions))
  route.options("/:id/approve", cors(adminCorsOptions))
  route.options("/:id/reject", cors(adminCorsOptions))

  // Админский route для получения всех отзывов
  route.get("/", cors(adminCorsOptions), wrapHandler(async (req, res) => {
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

  // Админский route для получения отзыва по ID
  route.get("/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const review = await reviewService.retrieveReview(id)
    
    res.json({ review })
  }))

  // Админский route для обновления отзыва
  route.put("/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const updated = await reviewService.updateReview(id, req.body)
    
    res.json({ review: updated })
  }))

  // Админский route для одобрения отзыва
  route.post("/:id/approve", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const updated = await reviewService.updateReview(id, { status: ReviewStatus.APPROVED })
    
    res.json({ review: updated })
  }))

  // Админский route для отклонения отзыва
  route.post("/:id/reject", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    const updated = await reviewService.updateReview(id, { status: ReviewStatus.REJECTED })
    
    res.json({ review: updated })
  }))

  // Админский route для удаления отзыва
  route.delete("/:id", cors(adminCorsOptions), wrapHandler(async (req, res) => {
    const { id } = req.params
    const reviewService = req.scope.resolve(REVIEW_MODULE)
    
    await reviewService.deleteReview(id)
    
    res.status(204).json({})
  }))

  return app
} 