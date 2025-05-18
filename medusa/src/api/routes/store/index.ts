import { Router } from "express"
import cors from "cors"
import { ConfigModule } from "@medusajs/framework/types"

const storeRoutes = Router()

export default (app, rootDirectory) => {
  const { projectConfig } = app.getConfigModule() as ConfigModule
  const corsOptions = {
    origin: projectConfig.http.storeCors.split(","),
    credentials: true,
  }
  
  storeRoutes.use(cors(corsOptions))
  
  return storeRoutes
} 