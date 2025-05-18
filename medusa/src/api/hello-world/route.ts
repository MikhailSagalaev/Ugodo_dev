import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

/**
 * @swagger
 * /hello-world:
 *   get:
 *     summary: Простой приветственный API метод
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Успешный ответ с приветственным сообщением
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello world!"
 */
export const GET = (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.json({
    message: "Hello world!",
  })
}

/**
 * @swagger
 * /hello-world:
 *   post:
 *     summary: Отправить приветственное сообщение
 *     tags: [Example]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Имя пользователя
 *     responses:
 *       200:
 *         description: Успешный ответ с персонализированным приветствием
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello, John!"
 */

interface HelloWorldPostBody {
  name?: string;
}

export const POST = (
  req: MedusaRequest<HelloWorldPostBody>,
  res: MedusaResponse
) => {
  const { name } = req.body

  res.json({
    message: `Hello, ${name || "anonymous"}!`,
  })
} 