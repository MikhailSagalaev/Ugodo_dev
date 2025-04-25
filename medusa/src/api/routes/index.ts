import { Router } from "express"
import admin from "./admin"
import store from "./store"
import swagger from "./swagger"

export default (app, rootDirectory) => {
  const router = Router()
  
  // Swagger документация
  router.use("/docs", swagger())
  
  // API маршруты для админки
  router.use("/admin", admin(app, rootDirectory))
  
  // API маршруты для магазина
  router.use("/store", store(app, rootDirectory))
  
  return router
} 