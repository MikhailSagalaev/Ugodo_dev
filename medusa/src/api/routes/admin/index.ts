import { Router } from "express"
import cors from "cors"
import { ConfigModule } from "@medusajs/medusa"
import authenticateAdmin from "../../middleware/authenticate-admin"
import banners from "./banners"
import reviews from "./reviews"

const adminRoutes = Router()

export default (app, rootDirectory) => {
  app.use("/admin", adminRoutes)
  
  const { projectConfig } = app.getConfigModule() as ConfigModule
  const corsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  }
  
  // Применяем CORS для админских маршрутов
  adminRoutes.use(cors(corsOptions))
  
  // Защищаем маршруты аутентификацией
  adminRoutes.use(authenticateAdmin())
  
  // Маршруты для баннеров
  banners(adminRoutes)
  
  // Маршруты для отзывов
  reviews(adminRoutes)
  
  return adminRoutes
} 