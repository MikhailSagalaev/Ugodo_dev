import { Router } from "express"
import cors from "cors"
import { ConfigModule } from "@medusajs/medusa"
import banners from "./banners"
import reviews from "./reviews"

const storeRoutes = Router()

export default (app, rootDirectory) => {
  app.use("/store", storeRoutes)
  
  const { projectConfig } = app.getConfigModule() as ConfigModule
  const corsOptions = {
    origin: projectConfig.store_cors.split(","),
    credentials: true,
  }
  
  // Применяем CORS для маршрутов магазина
  storeRoutes.use(cors(corsOptions))
  
  // Маршруты для баннеров
  banners(storeRoutes)
  
  // Маршруты для отзывов
  reviews(storeRoutes)
  
  return storeRoutes
} 