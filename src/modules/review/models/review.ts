import { model } from "@medusajs/framework/utils"

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       required:
 *         - id
 *         - content
 *         - rating
 *         - first_name
 *         - last_name
 *         - status
 *         - product_id
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор отзыва
 *         title:
 *           type: string
 *           description: Заголовок отзыва (опционально)
 *         content:
 *           type: string
 *           description: Текст отзыва
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *           description: Рейтинг товара от 1 до 5
 *         first_name:
 *           type: string
 *           description: Имя автора отзыва
 *         last_name:
 *           type: string
 *           description: Фамилия автора отзыва
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Статус отзыва
 *         product_id:
 *           type: string
 *           description: ID товара, к которому относится отзыв
 *         customer_id:
 *           type: string
 *           description: ID клиента, оставившего отзыв (опционально)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Дата создания отзыва
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления отзыва
 */

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

const Review = model.define("review", {
  id: model.id().primaryKey(),
  title: model.text().nullable(),
  content: model.text(),
  rating: model.float(),
  first_name: model.text(),
  last_name: model.text(),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  product_id: model.text().index("IDX_REVIEW_PRODUCT_ID"),
  customer_id: model.text().nullable(),
}).checks([
  {
    name: "rating_range", 
    expression: (columns) => `${columns.rating} >= 1 AND ${columns.rating} <= 5`,
  },
])

export default Review 