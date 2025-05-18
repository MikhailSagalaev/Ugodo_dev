import { Repository as MedusaRepository } from '@medusajs/medusa'
import { Banner } from './types'

export const BannerRepository = MedusaRepository.extend({
  target: Banner,
  tableName: 'banner',
}) 