import { Router } from "express"
import { wrapHandler } from "@medusajs/medusa"
import { list } from "./list"

const router = Router()

export default (app) => {
  app.use("/banners", router)

  /**
   * Список активных баннеров
   */
  router.get("/", wrapHandler(list))

  return router
} 