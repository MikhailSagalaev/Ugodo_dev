/**
 * @file: migrate_images_to_minio.js
 * @description: Скрипт для миграции существующих локальных изображений из файловой системы в Minio и обновления URL в базе данных Medusa.
 * @dependencies: pg, @aws-sdk/client-s3, dotenv
 * @created: 2025-05-21
 */

const { Pool } = require('pg');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs/promises');
const path = require('path');
const dotenv = require('dotenv');

// Загружаем переменные окружения из .env файла в корне medusa проекта
// Предполагается, что скрипт запускается из директории medusa/migration-scripts/
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DATABASE_URL from env:', process.env.DATABASE_URL);

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Обязательно для Minio
});

const S3_BUCKET_NAME = process.env.S3_BUCKET;
const S3_BASE_URL = process.env.S3_URL; // Например, https://api.ugodo.ru/files/medusa-uploads или http://minio:9000/medusa-uploads

// Базовый путь к директории, где Medusa хранила статические файлы локально
// Это значение возможно потребуется скорректировать в зависимости от вашей конфигурации
const LOCAL_STATIC_PATH_BASE = path.resolve(__dirname, '../static'); // Путь к medusa/static/
const LOCAL_UPLOADS_PATH_BASE = path.resolve(__dirname, '../uploads'); // Путь к medusa/uploads/ (если использовался)

// Префиксы старых URL, которые нужно искать в БД
const OLD_URL_PREFIXES = [
  'http://localhost:9000/static/',
  // Добавьте другие префиксы, если они использовались, например:
  // 'http://localhost:9000/uploads/',
  // '/static/', // если хранились относительные пути без домена
];

async function migrateImages() {
  console.log('Starting image migration to Minio...');
  let migratedCount = 0;
  let errorCount = 0;
  const client = await pgPool.connect();

  try {
    // TODO: Реализовать логику выборки из БД, загрузки в Minio и обновления БД
    console.log('Fetching images from database...');

    // Пример запроса, который нужно будет адаптировать:
    // Нам нужно найти все URL, которые начинаются с одного из OLD_URL_PREFIXES
    // и не являются уже URL-ами Minio (на всякий случай, чтобы не обрабатывать повторно)
    // Также, возможно, таблица называется не 'image' и поле не 'url'. Это нужно будет проверить.

    const queryText = `
      SELECT id, url FROM "image" 
      WHERE (${OLD_URL_PREFIXES.map((prefix, index) => `url LIKE '${prefix}%'`).join(' OR ')})
      AND url NOT LIKE '${S3_BASE_URL}%'; 
    `;
    // Примечание: название таблицы "image" может быть другим, например "custom_image_table" или что-то в этом роде.
    // Также, убедитесь, что S3_BASE_URL корректно отражает новый формат URL, чтобы не перезаписывать уже мигрированные.

    const res = await client.query(queryText);
    const imagesToMigrate = res.rows;

    console.log(`Found ${imagesToMigrate.length} images to migrate.`);

    for (const image of imagesToMigrate) {
      const oldUrl = image.url;
      console.log(`\nProcessing image ID ${image.id}: ${oldUrl}`);

      let localFilePath;
      let oldPathSegment;

      if (oldUrl.startsWith('http://localhost:9000/static/')) {
        oldPathSegment = oldUrl.substring('http://localhost:9000/static/'.length);
        const decodedPathSegment = decodeURIComponent(oldPathSegment.split('?')[0]); // Декодируем и убираем query params
        localFilePath = path.join(LOCAL_STATIC_PATH_BASE, decodedPathSegment);
      } else if (oldUrl.startsWith('http://localhost:9000/uploads/')) { // Если у вас были uploads
        oldPathSegment = oldUrl.substring('http://localhost:9000/uploads/'.length);
        const decodedPathSegment = decodeURIComponent(oldPathSegment.split('?')[0]); // Декодируем и убираем query params
        localFilePath = path.join(LOCAL_UPLOADS_PATH_BASE, decodedPathSegment);
      } else {
        console.warn(`Skipping image ID ${image.id} - URL prefix not recognized: ${oldUrl}`);
        continue;
      }
      
      // Убираем возможные query params из имени файла для S3 ключа (но не декодируем)
      const s3KeyPathSegment = oldPathSegment.split('?')[0];
      const fileName = path.basename(s3KeyPathSegment); // Для S3 ключа используем оригинальное (не декодированное) имя файла
      
      // Генерируем новый ключ для S3. Можно добавить префикс, например, 'products/'
      // Важно: S3_URL уже содержит /medusa-uploads, поэтому здесь только относительный путь в бакете
      const newS3Key = `products/${Date.now()}-${fileName}`; // Добавляем timestamp для уникальности

      try {
        console.log(`Attempting to read local file: ${localFilePath}`);
        const fileContent = await fs.readFile(localFilePath);
        console.log(`Local file read successfully. Size: ${fileContent.length} bytes.`);

        console.log(`Uploading to Minio with key: ${newS3Key}`);
        await s3Client.send(new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: newS3Key,
          Body: fileContent,
          // ACL: 'public-read', // Раскомментируйте, если бакет не настроен на public-read по умолчанию
          // ContentType: 'image/jpeg', // Укажите, если известен, или S3 попытается определить
        }));
        console.log(`Successfully uploaded to Minio.`);

        // Новый URL будет относительным путем (ключом) в Minio.
        // Medusa должна сама формировать полный URL на основе S3_URL и этого ключа.
        const newDbUrl = newS3Key; 

        console.log(`Updating database record for image ID ${image.id} with new URL: ${newDbUrl}`);
        await client.query('UPDATE "image" SET url = $1 WHERE id = $2', [newDbUrl, image.id]);
        console.log(`Database record updated.`);
        migratedCount++;

      } catch (err) {
        console.error(`Error processing image ID ${image.id} (${oldUrl}):`, err.message);
        if (err.code === 'ENOENT') {
            console.error(`File not found at ${localFilePath}. Skipping.`);
        }
        errorCount++;
      }
    }

  } catch (err) {
    console.error('Error during migration process:', err);
    errorCount++;
  } finally {
    await client.release();
    console.log('\nMigration process finished.');
    console.log(`Successfully migrated: ${migratedCount} images.`);
    console.log(`Errors: ${errorCount} images.`);
  }
}

migrateImages().catch(err => {
  console.error('Unhandled error in migrateImages:', err);
  process.exit(1);
}); 