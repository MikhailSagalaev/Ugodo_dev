import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml'; // Убедитесь, что js-yaml установлен: yarn add js-yaml

export async function GET() {
  console.log('Запрос к /api/swagger.json получен.'); // Лог начала
  try {
    // Путь к основному файлу OpenAPI YAML
    const openApiPath = path.join(process.cwd(), 'openapi (1).yaml');
    console.log('Ожидаемый путь к YAML:', openApiPath); // Лог пути

    if (!fs.existsSync(openApiPath)) {
      console.error('Основной файл openapi (1).yaml не найден по пути:', openApiPath);
      return NextResponse.json(
        { error: 'OpenAPI specification file not found.' },
        { status: 404 }
      );
    }
    console.log('Файл YAML найден.'); // Лог успеха поиска

    const yamlContent = fs.readFileSync(openApiPath, 'utf-8');
    console.log(`Содержимое YAML прочитано (первые 100 символов): ${yamlContent.substring(0, 100)}...`); // Лог чтения

    const mainSpec = yaml.load(yamlContent); // Парсим YAML в JavaScript объект
    console.log('Результат парсинга YAML:', typeof mainSpec === 'object' && mainSpec !== null ? 'Объект' : 'Не объект или null'); // Лог результата парсинга

    // Проверяем, что парсинг прошел успешно
    if (!mainSpec || typeof mainSpec !== 'object') {
       console.error('Ошибка парсинга openapi (1).yaml');
       return NextResponse.json(
         { error: 'Failed to parse OpenAPI specification file.' },
         { status: 500 }
       );
    }
    console.log('Парсинг YAML успешен.'); // Лог успеха парсинга

    // Возвращаем распарсенный объект как JSON
    console.log('Отправка JSON ответа...'); // Лог перед отправкой
    return NextResponse.json(mainSpec);

  } catch (error) {
    console.error('Ошибка при обработке запроса /api/swagger.json:', error); // Обновленный лог ошибки
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to serve OpenAPI specification: ${errorMessage}` },
      { status: 500 }
    );
  }
} 