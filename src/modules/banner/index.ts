/**
 * Модуль баннеров для управления баннерами на сайте
 */

import { MedusaModule } from "@medusajs/modules-sdk"
import BannerService from "./service"
import { Banner, CreateBannerInput, UpdateBannerInput, BannerPositionEnum, BannerSelector, BannerType } from "./types"
import { BaseService } from "@medusajs/medusa"
import { EntityManager } from "typeorm"

// Экспортируем типы для использования в других частях приложения
export { Banner, CreateBannerInput, UpdateBannerInput, BannerPositionEnum, BannerSelector, BannerType }

// Экспортируем типы для API роутов
export type CreateBannerDTO = CreateBannerInput
export type UpdateBannerDTO = UpdateBannerInput

// Создаем и экспортируем модуль баннеров
export const BannerModule = MedusaModule.forRoot({
  imports: [],
  providers: [
    {
      provide: "BannerService",
      useClass: BannerService,
    },
  ],
  exports: ["BannerService"],
})

// Экспортируем сервис для прямого использования
export default {
  service: {
    bannerService: BannerService,
  },
  loaders: [
    async (container, options) => {
      try {
        const bannerService = container.resolve("bannerService") as BaseService
        await bannerService.addDecorators(container)
      } catch (err) {
        console.error("Ошибка загрузки модуля баннеров:", err)
      }
    },
  ],
} 