import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import fs from "fs"
import path from "path"

/**
 * @swagger
 * /cache-demo-ui:
 *   get:
 *     summary: UI для демонстрации кеша
 *     description: Возвращает HTML страницу для демонстрации работы кеша
 *     responses:
 *       200:
 *         description: HTML страница
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  try {
    // Путь к HTML файлу относительно корня проекта
    const htmlPath = path.join(process.cwd(), "src", "examples", "cache-demo.html")
    
    // Проверяем, существует ли файл
    if (!fs.existsSync(htmlPath)) {
      return res.status(404).send("Демонстрационная страница не найдена")
    }
    
    // Читаем содержимое файла
    const htmlContent = fs.readFileSync(htmlPath, "utf8")
    
    // Устанавливаем заголовок Content-Type для HTML
    res.header("Content-Type", "text/html")
    
    // Отправляем содержимое файла
    return res.send(htmlContent)
  } catch (error) {
    console.error("Ошибка при обслуживании демонстрационной страницы:", error)
    return res.status(500).send("Произошла ошибка при загрузке демонстрационной страницы")
  }
} 