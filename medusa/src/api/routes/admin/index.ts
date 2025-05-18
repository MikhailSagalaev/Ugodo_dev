import { Router } from "express"
import cors from "cors"
// Попробуем импортировать стандартный middleware, если он есть
// import authenticateAdmin from "@medusajs/medusa/dist/api/middlewares/authenticate-admin" // Примерный путь
// Если стандартного нет, оставляем относительный путь
import { authenticateAdmin } from "../../../middleware/authenticate-admin"
// import { ConfigModule, ProjectConfigOptions } from "@medusajs/framework/types" 

const adminRoutes = Router()

export default (app, rootDirectory) => {
  app.use("/admin", adminRoutes)
  
  // Получаем CORS из process.env напрямую
  const adminCorsEnv = process.env.ADMIN_CORS
  
  if (!adminCorsEnv) {
    console.warn("ADMIN_CORS environment variable is not set.")
  }
  
  const corsOptions = {
    origin: adminCorsEnv ? adminCorsEnv.split(",") : [], 
    credentials: true,
  }
  
  // Применяем CORS для админских маршрутов
  adminRoutes.use(cors(corsOptions))
  
  // Проверяем, что authenticateAdmin - это функция перед вызовом
  if (typeof authenticateAdmin === 'function') {
    adminRoutes.use(authenticateAdmin)
  } else {
    console.error("authenticateAdmin is not a function. Check the import.")
    // Можно добавить обработку ошибки, если middleware не загрузился
  }
  
  return adminRoutes
} 