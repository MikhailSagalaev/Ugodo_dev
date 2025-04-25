import { Router } from "express"
import { wrapHandler } from "@medusajs/medusa"
import { list } from "./list"
import { get } from "./get"
import { create } from "./create"
import { update } from "./update"
import { _delete } from "./delete"

const router = Router()

export default (app) => {
  app.use("/banners", router)

  /**
   * Список всех баннеров
   */
  router.get("/", wrapHandler(list))

  /**
   * Получение баннера по ID
   */
  router.get("/:id", wrapHandler(get))

  /**
   * Создание баннера
   */
  router.post("/", wrapHandler(create))

  /**
   * Обновление баннера
   */
  router.put("/:id", wrapHandler(update))

  /**
   * Удаление баннера
   */
  router.delete("/:id", wrapHandler(_delete))

  return router
} 