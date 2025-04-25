/**
 * Типы данных для модуля баннеров
 */

import { BaseEntity } from "@medusajs/medusa"

export enum BannerPositionEnum {
  HOME_TOP = "home_top",
  HOME_MIDDLE = "home_middle", 
  HOME_BOTTOM = "home_bottom",
  CATEGORY_TOP = "category_top",
  PRODUCT_RELATED = "product_related"
}

export type BannerType = {
  id: string
  title: string
  subtitle?: string
  handle?: string
  position: BannerPositionEnum
  active: boolean
  image_url: string
  link_url?: string
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export interface Banner extends BaseEntity {
  title: string
  subtitle?: string
  handle?: string
  description: string | null
  image_url: string
  position: BannerPositionEnum
  link_url?: string
  active: boolean
  created_at: Date
  updated_at: Date
  deleted_at?: Date
}

export type BannerSelector = {
  id?: string
  position?: BannerPositionEnum
  active?: boolean
}

export type CreateBannerInput = {
  title: string
  subtitle?: string
  description?: string
  handle?: string
  image_url: string
  position?: BannerPositionEnum
  link_url?: string
  active?: boolean
}

export type UpdateBannerInput = {
  title?: string
  subtitle?: string
  description?: string
  handle?: string
  image_url?: string
  position?: BannerPositionEnum
  link_url?: string
  active?: boolean
} 