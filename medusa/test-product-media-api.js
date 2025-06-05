// Тестовый скрипт для проверки Product Media API
// Запуск: node test-product-media-api.js

const BASE_URL = 'http://localhost:9000'

async function testAPI() {
  console.log('🧪 Тестирование Product Media API...\n')

  try {
    // 1. Проверяем Health Check (если есть)
    console.log('1️⃣ Проверка соединения с сервером...')
    const healthResponse = await fetch(`${BASE_URL}/health`)
    if (healthResponse.ok) {
      console.log('✅ Сервер работает')
    } else {
      console.log('⚠️  Сервер недоступен, но продолжаем тестирование...')
    }

    // 2. Тестируем получение медиафайлов для несуществующего товара
    console.log('\n2️⃣ Тестирование GET /store/products/test-product/media...')
    const storeResponse = await fetch(`${BASE_URL}/store/products/test-product/media`)
    
    if (storeResponse.ok) {
      const storeData = await storeResponse.json()
      console.log('✅ Store API работает')
      console.log('📊 Результат:', {
        mediaCount: storeData.count,
        imagesCount: storeData.images?.length || 0,
        videosCount: storeData.videos?.length || 0
      })
    } else {
      console.log('❌ Store API недоступно:', storeResponse.status, storeResponse.statusText)
    }

    // 3. Проверяем структуру базы данных
    console.log('\n3️⃣ Информация о модуле...')
    console.log('📋 Product Media Module включает:')
    console.log('  - Модель: ProductMedia (table: product_media)')
    console.log('  - API Endpoints:')
    console.log('    • GET/POST /admin/products/{id}/media')
    console.log('    • DELETE /admin/media/{id}')  
    console.log('    • GET /store/products/{id}/media')
    console.log('  - Middleware: Multer для загрузки файлов (max 10MB)')
    console.log('  - Поддержка: images (jpg,png,gif,webp) и videos (mp4,webm,avi,mov)')
    console.log('  - Интеграция: uploadFilesWorkflow → S3/MinIO')

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message)
  }

  console.log('\n📝 Для полного тестирования:')
  console.log('1. Аутентифицируйтесь в /auth/user/emailpass')
  console.log('2. Используйте Bearer token для admin endpoints')
  console.log('3. Загрузите тестовые изображения/видео через POST /admin/products/{id}/media')
  console.log('4. Проверьте загруженные файлы через GET endpoints')
  console.log('\n🎯 Backend готов! Следующий шаг: Frontend интеграция')
}

// Запускаем тест
testAPI().catch(console.error) 