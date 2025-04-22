import { ConfigModule } from "@medusajs/framework/types"
import Redis from "ioredis"

/**
 * Сервис для кеширования данных на основе Redis
 * Использует Redis для хранения кешированных данных
 */
export default class RedisCacheService {
  protected readonly config: ConfigModule
  protected readonly redis: Redis
  protected readonly namespace: string
  protected readonly defaultTTL: number // в секундах

  constructor({ configModule, options = {} }) {
    this.config = configModule
    
    // Опции
    const { ttl = 3600, namespace = "medusa:" } = options
    this.namespace = namespace
    this.defaultTTL = ttl
    
    // Получаем URL Redis из переменных окружения или конфигурации
    let redisUrl = process.env.REDIS_URL
    
    // Если проектная конфигурация содержит redisUrl, используем его
    if (this.config && this.config.projectConfig && this.config.projectConfig.redisUrl) {
      redisUrl = this.config.projectConfig.redisUrl
    }
    
    // Если не указан URL Redis, выдаем предупреждение
    if (!redisUrl) {
      console.warn("Redis URL is not provided, using default localhost:6379")
      redisUrl = "redis://localhost:6379"
    }
    
    // Создаем клиент Redis
    this.redis = new Redis(redisUrl)
    
    // Обработка ошибок Redis
    this.redis.on("error", (err) => {
      console.error("Redis cache error:", err)
    })
    
    // Проверяем соединение при инициализации
    this.redis.ping().then(() => {
      console.info("Redis cache connection established")
    }).catch(err => {
      console.error("Failed to connect to Redis cache:", err)
    })
  }

  /**
   * Получить значение из кэша
   * @param key Ключ
   * @returns Значение или null, если ключ не найден или истек срок действия
   */
  async get(key: string): Promise<any> {
    const prefixedKey = this.getKeyWithPrefix(key)
    
    try {
      const value = await this.redis.get(prefixedKey)
      
      if (!value) {
        return null
      }
      
      // Пытаемся преобразовать строку в JSON
      try {
        return JSON.parse(value)
      } catch (e) {
        // Если не получается, возвращаем как есть
        return value
      }
    } catch (error) {
      console.error(`Error getting from Redis cache (${key}):`, error)
      return null
    }
  }

  /**
   * Установить значение в кэш
   * @param key Ключ
   * @param value Значение
   * @param ttl Время жизни в секундах (по умолчанию 1 час)
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    const prefixedKey = this.getKeyWithPrefix(key)
    
    try {
      // Преобразуем объекты в JSON-строку
      const stringValue = typeof value === 'string' 
        ? value 
        : JSON.stringify(value)
      
      // Устанавливаем значение с TTL
      await this.redis.set(prefixedKey, stringValue, 'EX', ttl)
    } catch (error) {
      console.error(`Error setting Redis cache (${key}):`, error)
    }
  }

  /**
   * Удалить значение из кэша
   * @param key Ключ
   */
  async delete(key: string): Promise<void> {
    const prefixedKey = this.getKeyWithPrefix(key)
    
    try {
      await this.redis.del(prefixedKey)
    } catch (error) {
      console.error(`Error deleting from Redis cache (${key}):`, error)
    }
  }

  /**
   * Очистить кэш по шаблону ключа (по умолчанию - весь кэш в нашем namespace)
   * @param pattern Шаблон ключа (по умолчанию очищает весь кэш модуля)
   */
  async clear(pattern: string = '*'): Promise<void> {
    const prefixedPattern = this.getKeyWithPrefix(pattern)
    
    try {
      // Получаем все ключи по шаблону
      const keys = await this.redis.keys(prefixedPattern)
      
      if (keys.length > 0) {
        // Удаляем все найденные ключи
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.error(`Error clearing Redis cache (${pattern}):`, error)
    }
  }

  /**
   * Добавляет префикс namespace к ключу
   * @param key Исходный ключ
   * @returns Ключ с префиксом
   */
  private getKeyWithPrefix(key: string): string {
    return `${this.namespace}${key}`
  }
} 