import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

/**
 * @swagger
 * /doc/example:
 *   get:
 *     summary: Тестовый маршрут для проверки Swagger
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Успешный ответ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Тестовый пример для Swagger"
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  res.json({ message: "Тестовый пример для Swagger" })
}

export const OPTIONS = async (req: MedusaRequest, res: MedusaResponse) => {
  res.json({ success: true })
} 