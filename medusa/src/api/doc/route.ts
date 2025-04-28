import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import path from "path"
import fs from "fs"
import yaml from 'js-yaml';
import { merge } from 'lodash';

// Убедитесь, что lodash установлен: cd medusa && yarn add lodash @types/lodash && cd ..

// Получаем путь к корневой директории проекта (предполагаем, что бэкенд запускается из папки medusa)
// Корректируем путь, чтобы подняться на уровень выше к корню проекта
const projectRoot = path.join(process.cwd(), '..');
const openApiPath = path.join(projectRoot, 'openapi (2).yaml');
const rootDir = process.cwd(); // Для путей в swagger-jsdoc оставляем текущий (medusa/)

// --- Функция для получения и объединения спецификаций ---
const getMergedSwaggerSpec = () => {
  let yamlSpec: any = { openapi: '3.0.0', info: {}, servers: [], tags: [], paths: {}, components: {} };
  let generatedSpec: any = { paths: {}, components: {} };

  // 1. Загружаем YAML
  try {
    if (fs.existsSync(openApiPath)) {
      const yamlContent = fs.readFileSync(openApiPath, 'utf-8');
      yamlSpec = yaml.load(yamlContent) as any;
      console.log("Файл openapi (2).yaml успешно загружен и распарсен.");
      // Убедимся, что основные разделы существуют
      yamlSpec.paths = yamlSpec.paths || {};
      yamlSpec.components = yamlSpec.components || {};
      yamlSpec.tags = yamlSpec.tags || [];
    } else {
      console.warn(`Файл ${openApiPath} не найден. Используется базовая структура.`);
    }
  } catch (error) {
    console.error(`Ошибка при загрузке или парсинге ${openApiPath}:`, error);
    // Используем базовую структуру в случае ошибки
    yamlSpec = { openapi: '3.0.0', info: { title: 'Error Loading YAML', version: '0.0.0'}, servers: [], tags: [], paths: {}, components: {} };
  }

  // 2. Генерируем из аннотаций
  try {
     // Базовое определение swagger для jsdoc (можно вынести из yamlSpec, если нужно)
      const swaggerDefinitionBase = {
        openapi: yamlSpec.openapi || "3.0.0",
        info: yamlSpec.info || { title: "Generated API Docs", version: "1.0.0"}, // Берем info из YAML
        servers: yamlSpec.servers || [], // Берем servers из YAML
         // Components и Security Schemes будут объединены позже
      };

const options = {
        swaggerDefinition: swaggerDefinitionBase,
  apis: [
          // Пути относительно `rootDir` (medusa/)
          path.join(rootDir, 'src/modules/*/api/routes/*.ts'),
          path.join(rootDir, 'src/modules/*/models/*.ts'), // Добавим модели для схем
          path.join(rootDir, 'src/api/**/*.ts'),
           // Пути из примеров могут вызвать дублирование или ошибки, если не настроены правильно
           // path.join(rootDir, '../examples/**/api/**/*.ts'), // Осторожно с этим
        ],
      };
      generatedSpec = swaggerJSDoc(options);
      console.log("Спецификация из аннотаций успешно сгенерирована.");
       // Убедимся, что основные разделы существуют
      generatedSpec.paths = generatedSpec.paths || {};
      generatedSpec.components = generatedSpec.components || {};
      generatedSpec.tags = generatedSpec.tags || []; // Теги из аннотаций

  } catch (error) {
      console.error("Ошибка при генерации спецификации из аннотаций:", error);
       generatedSpec = { paths: {}, components: {}, tags: [] };
  }

  // 3. Объединяем спецификации
  // Сначала создаем копии, чтобы не мутировать исходные объекты
  const safeGeneratedComponents = JSON.parse(JSON.stringify(generatedSpec.components || {}));
  const safeYamlComponents = JSON.parse(JSON.stringify(yamlSpec.components || {}));

  const mergedSpec = {
    openapi: yamlSpec.openapi || generatedSpec.openapi || '3.0.0',
    info: yamlSpec.info || generatedSpec.info,
    servers: yamlSpec.servers || generatedSpec.servers || [],
    // Объединяем теги, удаляем дубликаты по имени
    tags: [
        ...(yamlSpec.tags || []),
        ...(generatedSpec.tags || []).filter((genTag: any) =>
            !(yamlSpec.tags || []).some((yamlTag: any) => yamlTag.name === genTag.name)
        )
    ].sort((a, b) => a.name.localeCompare(b.name)), // Сортируем теги по имени
    // Объединяем пути: YAML перезаписывает сгенерированные при конфликте
    paths: {
      ...(generatedSpec.paths || {}),
      ...(yamlSpec.paths || {}),
    },
    // Глубокое объединение компонентов с помощью lodash.merge
    components: merge({}, safeGeneratedComponents, safeYamlComponents),
    security: yamlSpec.security || generatedSpec.security || [], // Берем security из YAML или сгенерированного
  };

  console.log("Спецификации успешно объединены.");
  return mergedSpec;
}


// --- Функция для генерации HTML ---
const generateSwaggerUIHtml = (swaggerSpec: any) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Medusa API Documentation" />
  <title>Medusa API Documentation (Merged)</title>
  <link rel=\"stylesheet\" type=\"text/css\" href=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui.css\" /> {/* Обновим версию UI */}
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *,
    *:before,
    *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
    }
    .topbar { /* Убираем старый topbar, т.к. DownloadUrl плагин добавит свой */
        display: none;
    }
  </style>
</head>
<body>
  {/* Убираем старый topbar div */}
  <div id="swagger-ui"></div>
  <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js\"></script> {/* Обновим версию UI */}
  <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js\"></script> {/* Обновим версию UI */}
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(swaggerSpec)}, // Передаем объединенную спецификацию
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl // Используем стандартный плагин для скачивания
        ],
        layout: "StandaloneLayout",
        tagsSorter: "alpha", // Сортировка тегов
        operationsSorter: "alpha", // Сортировка операций
        docExpansion: "none", // Свернуть все теги по умолчанию
        filter: true, // Включаем фильтр по тегам/операциям
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true, // Разрешаем "Try it out"
        requestSnippetsEnabled: true, // Показываем примеры запросов
        displayRequestDuration: true // Показываем длительность запроса
      });
    };
  </script>
</body>
</html>
  `;
}

// --- Обработчик GET ---
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  console.log(`Запрос к бэкенд-документации: ${req.url}`);
  try {
      const finalSpec = getMergedSwaggerSpec(); // Получаем объединенную спецификацию

  // Если запрашивается swagger.json, возвращаем спецификацию
      if (req.url?.endsWith("/swagger.json")) { // Добавляем проверку req.url
        console.log("Отдаем объединенную спецификацию как JSON.");
        res.setHeader("Content-Type", "application/json");
        res.json(finalSpec);
        return;
      }

      // Генерируем HTML для Swagger UI с объединенной спецификацией
      console.log("Генерируем и отдаем HTML для Swagger UI.");
      const html = generateSwaggerUIHtml(finalSpec);
  
  // Отправляем HTML
      res.setHeader("Content-Type", "text/html");
      res.send(html);

  } catch(error) {
       console.error("Критическая ошибка в обработчике GET /doc:", error);
       res.status(500).send("Internal Server Error while generating API documentation.");
  }
}

// Убедитесь, что нет других экспортров GET или обработчиков для /doc
// Например, удалите или закомментируйте старую функцию GET_SWAGGER_UI, если она была

// Обработчик OPTIONS запроса (для CORS)
export const OPTIONS = (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.status(200).send()
}

// Экспортируем JSON-версию спецификации для использования в инструментах
export const getSwaggerSpec = () => getMergedSwaggerSpec() 