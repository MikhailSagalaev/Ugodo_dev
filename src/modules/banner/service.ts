import { MedusaError, TransactionBaseService } from '@medusajs/medusa'
import { EntityManager } from 'typeorm'
import { BannerRepository } from './repository'
import { Banner, BannerSelector, CreateBannerInput, UpdateBannerInput, BannerPositionEnum } from './types'
import { generateEntityId } from '@medusajs/utils'

type BannerServiceProps = {
  manager: EntityManager
  bannerRepository: typeof BannerRepository
}

class BannerService extends TransactionBaseService {
  protected bannerRepository_: typeof BannerRepository
  
  constructor({ manager, bannerRepository }: BannerServiceProps) {
    super(arguments[0])
    this.manager_ = manager
    this.bannerRepository_ = bannerRepository
  }

  async create(data: CreateBannerInput): Promise<Banner> {
    return await this.atomicPhase_(async (manager) => {
      const bannerRepo = manager.withRepository(this.bannerRepository_)
      
      const banner = bannerRepo.create({
        id: generateEntityId('banner', 'bnr'),
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
      })
      
      return await bannerRepo.save(banner)
    })
  }
  
  async update(id: string, data: UpdateBannerInput): Promise<Banner> {
    return await this.atomicPhase_(async (manager) => {
      const bannerRepo = manager.withRepository(this.bannerRepository_)
      
      const banner = await this.retrieve(id)
      
      for (const [key, value] of Object.entries(data)) {
        banner[key] = value
      }
      
      banner.updated_at = new Date()
      
      return await bannerRepo.save(banner)
    })
  }
  
  async delete(id: string): Promise<void> {
    return await this.atomicPhase_(async (manager) => {
      const bannerRepo = manager.withRepository(this.bannerRepository_)
      
      const banner = await this.retrieve(id)
      
      await bannerRepo.remove(banner)
    })
  }
  
  async retrieve(id: string, config = {}): Promise<Banner> {
    const bannerRepo = this.manager_.withRepository(this.bannerRepository_)
    
    const banner = await bannerRepo.findOne({ where: { id } })
    
    if (!banner) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Banner with id: ${id} was not found`
      )
    }
    
    return banner
  }
  
  async list(selector: BannerSelector = {}, config = {}): Promise<Banner[]> {
    const bannerRepo = this.manager_.withRepository(this.bannerRepository_)
    
    const query = bannerRepo.createQueryBuilder('banner')
    
    if (selector.id) {
      query.andWhere('banner.id = :id', { id: selector.id })
    }
    
    if (selector.position) {
      query.andWhere('banner.position = :position', { position: selector.position })
    }
    
    if (selector.active !== undefined) {
      query.andWhere('banner.active = :active', { active: selector.active })
    }
    
    return await query.getMany()
  }
}

export default BannerService 