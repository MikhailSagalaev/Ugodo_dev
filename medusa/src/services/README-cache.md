# Кеширование в Medusa

В этом проекте реализовано два сервиса кеширования:

1. `CacheService` - простое in-memory кеширование 
2. `RedisCacheService` - кеширование с использованием Redis

## Архитектура кеширования

Система кеширования позволяет:
- Хранить данные в памяти или Redis
- Автоматически переключаться между in-memory кешем и Redis в зависимости от конфигурации
- Настраивать время жизни кеша (TTL)
- Указывать пространство имен для ключей кеша

## Конфигурация

Конфигурация кеширования находится в файле `medusa-config.ts`. Основные настройки:

```typescript
// Встроенный модуль Redis Cache от Medusa
{
  resolve: "@medusajs/cache-redis",
  options: {
    redisUrl: process.env.REDIS_URL,
    ttl: 30, // время жизни кеша в секундах
  }
}

// Сервис кеширования (выбирается автоматически в зависимости от наличия Redis)
process.env.REDIS_URL ? {
  resolve: "./medusa/src/services/redis-cache",
  options: {
    ttl: 3600, // 1 час по умолчанию
    namespace: "medusa:",
  },
  containerName: "cacheService"
} : {
  resolve: "./medusa/src/services/cache",
  options: {},
  containerName: "cacheService"
}
```

## Использование

Кеш можно использовать в любом сервисе или API через DI контейнер:

```typescript
// В API 
const cacheService = req.scope.resolve("cacheService")

// В сервисе
constructor({ cacheService }) {
  this.cacheService = cacheService
}
```

### Основные методы

```typescript
// Получить значение из кеша
const value = await cacheService.get(key)

// Установить значение в кеш с TTL
await cacheService.set(key, value, ttl)

// Удалить значение из кеша
await cacheService.delete(key)

// Очистить весь кеш (или по шаблону)
await cacheService.clear(pattern)
```

## Демонстрация

Для демонстрации работы кеша в проекте реализованы:

1. API эндпоинт `/cache-demo` - показывает работу кеша
2. API эндпоинт `/cache-demo-ui` - HTML страница для взаимодействия с кешем

### Пример использования

```typescript
// Получение данных из кеша или генерация новых
const cachedData = await cacheService.get(`cache_key:${id}`)

if (cachedData) {
  return cachedData
}

// Дорогостоящая операция
const result = await expensiveOperation()

// Кешируем результат на 5 минут
await cacheService.set(`cache_key:${id}`, result, 300)

return result
```

## Автоматическое переключение

Сервис автоматически выбирается при настройке Medusa. Если настроена переменная среды `REDIS_URL`, то используется Redis; в противном случае используется in-memory кеш.

## Рекомендации

1. Используйте префиксы для ключей, чтобы избежать конфликтов
2. Настраивайте TTL в зависимости от частоты изменения данных
3. В продакшн-среде используйте Redis для кеширования
4. Не кешируйте данные, которые часто меняются или уникальны для пользователя 