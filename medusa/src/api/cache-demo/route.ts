import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ICacheService } from "@medusajs/types";

/**
 * @swagger
 * /cache-demo:
 *   get:
 *     summary: Демонстрация работы кеша
 *     description: Возвращает данные, которые могут быть кешированы, содержит искусственную задержку для демонстрации эффекта кеширования
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: Ключ для получения данных из кеша (по умолчанию "test")
 *       - in: query
 *         name: ttl
 *         schema:
 *           type: integer
 *         description: Время жизни кеша в секундах (по умолчанию 30)
 *       - in: query
 *         name: clear
 *         schema:
 *           type: boolean
 *         description: Если true, то кеш будет очищен перед выполнением запроса
 *     responses:
 *       200:
 *         description: Успешное получение данных
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 fromCache:
 *                   type: boolean
 *                 timestamp:
 *                   type: string
 *                 message:
 *                   type: string
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Получаем параметры запроса
  const key = req.query.key as string || "test"
  const ttl = parseInt(req.query.ttl as string || "30", 10)
  const shouldClear = req.query.clear === "true"
  
  // Получаем сервис кеширования
  const cacheService = req.scope.resolve<ICacheService>("cacheService") as any
  
  // Очистка кеша, если запрошено
  if (shouldClear) {
    await cacheService.delete(`cache_demo:${key}`)
    console.log(`Кеш очищен для ключа: cache_demo:${key}`)
  }
  
  // Попытка получить данные из кеша
  const cachedData = await cacheService.get(`cache_demo:${key}`)
  
  if (cachedData) {
    console.log(`Данные получены из кеша для ключа: cache_demo:${key}`)
    return res.json({
      data: cachedData,
      fromCache: true,
      timestamp: new Date().toISOString(),
      message: `Данные получены из кеша. Они были сохранены в ${cachedData.timestamp}`
    })
  }
  
  // Искусственная задержка для демонстрации эффекта кеширования
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Генерируем данные
  const data = {
    randomNumber: Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    key: key
  }
  
  // Сохраняем данные в кеш
  await cacheService.set(`cache_demo:${key}`, data, ttl)
  console.log(`Данные сохранены в кеш для ключа: cache_demo:${key} с TTL: ${ttl}s`)
  
  return res.json({
    data: data,
    fromCache: false,
    timestamp: new Date().toISOString(),
    message: "Данные сгенерированы. Проверьте повторный запрос, чтобы увидеть данные из кеша."
  })
}

/**
 * @swagger
 * /cache-demo:
 *   delete:
 *     summary: Очистка кеша
 *     description: Очищает все ключи кеша, связанные с демонстрацией
 *     responses:
 *       200:
 *         description: Кеш успешно очищен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
export const DELETE = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const cacheService = req.scope.resolve<ICacheService>("cacheService") as any
  
  try {
    // Очищаем все ключи, начинающиеся с "cache_demo:"
    await cacheService.clear("cache_demo:*")
    
    return res.json({
      success: true,
      message: "Кеш демонстрации очищен"
    })
  } catch (error) {
    console.error("Ошибка при очистке кеша:", error)
    return res.status(500).json({
      success: false,
      message: "Произошла ошибка при очистке кеша"
    })
  }
} 