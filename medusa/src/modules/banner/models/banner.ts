import { model } from "@medusajs/framework/utils"

export enum BannerPositionEnum {
  HOME_TOP = "home_top",
  HOME_MIDDLE = "home_middle",
  HOME_BOTTOM = "home_bottom",
  CATEGORY_TOP = "category_top",
  PRODUCT_RELATED = "product_related"
}

const Banner = model.define("banner", {
  id: model.id().primaryKey(),
  title: model.text(),
  subtitle: model.text(),
  handle: model.text(),
  description: model.text(),
  position: model.enum(Object.values(BannerPositionEnum)).default(BannerPositionEnum.HOME_TOP),
  active: model.boolean().default(true),
  image_url: model.text(),
  link_url: model.text(),
})

export default Banner 