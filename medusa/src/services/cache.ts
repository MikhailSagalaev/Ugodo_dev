import { ConfigModule } from "@medusajs/framework/types"

/**
 * Простой сервис для кэширования данных
 * В реальном проекте лучше использовать Redis или другую базу данных для кэширования
 */
export default class CacheService {
  protected readonly config: ConfigModule
  protected readonly cache: Map<string, { value: any, expiry: number }>

  constructor({ configModule }) {
    this.config = configModule
    this.cache = new Map()
    
    // Очистка устаревших записей каждую минуту
    setInterval(this.cleanup.bind(this), 60000)
  }

  /**
   * Получить значение из кэша
   * @param key Ключ
   * @returns Значение или null, если ключ не найден или истек срок действия
   */
  async get(key: string): Promise<any> {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    // Проверяем срок действия
    if (item.expiry < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  /**
   * Установить значение в кэш
   * @param key Ключ
   * @param value Значение
   * @param ttl Время жизни в секундах (по умолчанию 1 час)
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttl * 1000)
    })
  }

  /**
   * Удалить значение из кэша
   * @param key Ключ
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  /**
   * Очистить весь кэш
   */
  async clear(): Promise<void> {
    this.cache.clear()
  }

  /**
   * Очистить устаревшие записи
   */
  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, item] of this.cache.entries()) {
      if (item.expiry < now) {
        this.cache.delete(key)
      }
    }
  }
} 