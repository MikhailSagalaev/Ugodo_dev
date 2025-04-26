import { Router } from "express"
import cors from "cors"
import { ConfigModule } from "@medusajs/framework/types"


const storeRoutes = Router()

export default (app, rootDirectory) => {
  app.use("/store", storeRoutes)
  
  const { projectConfig } = app.getConfigModule() as ConfigModule
  const corsOptions = {
    origin: projectConfig.http.storeCors.split(","),
    credentials: true,
  }
  
  // Применяем CORS для маршрутов магазина
  storeRoutes.use(cors(corsOptions))
  
  return storeRoutes
} 