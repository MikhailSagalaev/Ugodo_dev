import { MedusaService } from "@medusajs/framework/utils"
import Banner from "./models/banner"

class BannerModuleService extends MedusaService({
  Banner,
}) {
  // Здесь можно добавить кастомную логику при необходимости
}

export default BannerModuleService 