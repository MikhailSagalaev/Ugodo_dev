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
const backendOpenApiPath = path.join(projectRoot, 'openapi (2).yaml'); // Бэкенд спецификация
const frontendOpenApiPath = path.join(projectRoot, 'openapi (1).yaml'); // Фронтенд спецификация
const rootDir = process.cwd(); // Для путей в swagger-jsdoc оставляем текущий (medusa/)

// --- Функция для получения и объединения спецификаций (теперь для бэкенда + аннотации) ---
const getMergedSwaggerSpec = () => {
  let yamlSpec: any = { openapi: '3.0.0', info: {}, servers: [], tags: [], paths: {}, components: {} };
  let generatedSpec: any = { paths: {}, components: {} };

  // 1. Загружаем YAML (теперь это backendOpenApiPath)
  try {
    if (fs.existsSync(backendOpenApiPath)) {
      const yamlContent = fs.readFileSync(backendOpenApiPath, 'utf-8');
      yamlSpec = yaml.load(yamlContent) as any;
      console.log(`Файл ${path.basename(backendOpenApiPath)} успешно загружен и распарсен.`);
      // Убедимся, что основные разделы существуют
      yamlSpec.paths = yamlSpec.paths || {};
      yamlSpec.components = yamlSpec.components || {};
      yamlSpec.tags = yamlSpec.tags || [];
    } else {
      console.warn(`Файл ${path.basename(backendOpenApiPath)} не найден. Используется базовая структура.`);
    }
  } catch (error) {
    console.error(`Ошибка при загрузке или парсинге ${path.basename(backendOpenApiPath)}:`, error);
    // Используем базовую структуру в случае ошибки
    yamlSpec = { openapi: '3.0.0', info: { title: `Error Loading ${path.basename(backendOpenApiPath)}`, version: '0.0.0'}, servers: [], tags: [], paths: {}, components: {} };
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

  // Принудительно устанавливаем нужный сервер
  mergedSpec.servers = [
    {
      url: "http://89.108.110.26:9000",
      description: "Production Server Ugodo"
    }
  ];

  // Добавляем описания к тегам Store и Admin
  const storeTag = mergedSpec.tags.find(tag => tag.name === "Store");
  if (storeTag) {
    storeTag.description = "Методы API для клиентской части (магазина)";
  } else {
    // Если тега "Store" нет, но мы ожидаем его, можно добавить его в массив mergedSpec.tags
    // Однако, если пути не помечены этим тегом, он будет пустым.
    // Лучше убедиться, что аннотации @swagger в коде Store API используют тег "Store".
    console.warn("Тег 'Store' не найден в спецификации. Описание не будет добавлено.");
  }

  const adminTag = mergedSpec.tags.find(tag => tag.name === "Admin");
  if (adminTag) {
    adminTag.description = "Методы API для административной панели";
  } else {
    console.warn("Тег 'Admin' не найден в спецификации. Описание не будет добавлено.");
  }
  
  // Добавляем securitySchemes и глобальный security
  mergedSpec.components = mergedSpec.components || {};
  mergedSpec.components.securitySchemes = {
    ...(mergedSpec.components.securitySchemes || {}), // Сохраняем существующие схемы, если есть
    publishableApiKey: {
      type: "apiKey",
      in: "header",
      name: "x-publishable-api-key", // Стандартный заголовок для Medusa, можно изменить при необходимости
      description: "Publishable API Key for Store API access. Get it from your Medusa admin."
    },
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Bearer Token for Admin API access. Obtain by logging into the admin panel."
    },
    cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "connect.sid", // Имя сессионной cookie Medusa
        description: "Session cookie for Admin API access (alternative to Bearer token)."
    }
  };

  // Применяем схемы безопасности глобально.
  // Это означает, что кнопка Authorize будет доступна, и выбранный метод авторизации
  // будет применяться ко всем запросам, если для конкретной операции не указано иное.
  // Для более гранулярного контроля можно определять 'security' для каждой операции отдельно.
  mergedSpec.security = [
    { bearerAuth: [] },
    { cookieAuth: [] },
    { publishableApiKey: [] } // Для Store API эндпоинтов, которые его требуют.
                               // Если не все Store API его требуют, лучше применять это на уровне операций.
  ];

  // Пересортируем теги, чтобы теги с описаниями (особенно Store и Admin) были заметнее,
  // или чтобы пользовательский порядок соблюдался, если он задан.
  // В данном случае, просто оставим существующую алфавитную сортировку,
  // но описания сделают их более понятными.

  console.log("Спецификации успешно объединены.");
  return mergedSpec;
}

/* // Закомментировано, так как frontend spec теперь берется напрямую из openapi (1).yaml
// --- Новая функция для фильтрации спецификации только для Store API ---
function filterStoreApiSpec(fullSpec: any): any {
    const storeSpec: any = {
        openapi: fullSpec.openapi,
        info: JSON.parse(JSON.stringify(fullSpec.info)), // Deep copy
        servers: JSON.parse(JSON.stringify(fullSpec.servers)), // Deep copy
        paths: {},
        components: {
            schemas: JSON.parse(JSON.stringify(fullSpec.components?.schemas || {})), // Deep copy all schemas for now
            securitySchemes: {}
        },
        tags: [],
        security: []
    };

    storeSpec.info.title = `${fullSpec.info.title || 'API Documentation'} - Store API`;

    const usedTags = new Set<string>();
    // "Store" тег является ключевым для идентификации Store API эндпоинтов
    // usedTags.add("Store"); // Мы добавим его позже, если он действительно используется или определен

    for (const path in fullSpec.paths) {
        const pathItem = fullSpec.paths[path];
        const newPathItem: any = {};
        let hasStoreOperation = false;

        for (const method in pathItem) {
            const operation = pathItem[method];
            // Проверяем наличие тега "Store"
            if (operation.tags && operation.tags.includes("Store")) {
                newPathItem[method] = JSON.parse(JSON.stringify(operation)); // Deep copy operation
                // Добавляем все теги этой операции в набор используемых
                if (Array.isArray(operation.tags)) {
                    operation.tags.forEach(tag => usedTags.add(tag));
                }
                hasStoreOperation = true;
            }
        }

        if (hasStoreOperation) {
            storeSpec.paths[path] = newPathItem;
        }
    }

    // Фильтруем и добавляем теги: только те, что используются в Store API операциях
    if (fullSpec.tags && Array.isArray(fullSpec.tags)) {
        storeSpec.tags = fullSpec.tags.filter(tagObj => tagObj.name && usedTags.has(tagObj.name))
                                     .map(tagObj => JSON.parse(JSON.stringify(tagObj))); // Deep copy
    }
    
    // Убедимся, что тег "Store" присутствует и имеет описание, если он был определен в fullSpec
    const storeTagDefinition = fullSpec.tags?.find(t => t.name === "Store");
    if (storeTagDefinition) {
        let existingStoreTagInFiltered = storeSpec.tags.find(t => t.name === "Store");
        if (!existingStoreTagInFiltered) {
            storeSpec.tags.push(JSON.parse(JSON.stringify(storeTagDefinition)));
        } else {
            // Если тег "Store" уже добавлен (потому что был использован), обновим его описание на всякий случай
            existingStoreTagInFiltered.description = storeTagDefinition.description || existingStoreTagInFiltered.description;
        }
    }
    // Сортируем теги для консистентности
    storeSpec.tags.sort((a, b) => a.name.localeCompare(b.name));


    // Добавляем securityScheme для Store API (publishableApiKey)
    if (fullSpec.components?.securitySchemes?.publishableApiKey) {
        storeSpec.components.securitySchemes.publishableApiKey = 
            JSON.parse(JSON.stringify(fullSpec.components.securitySchemes.publishableApiKey));
    }
    
    // Устанавливаем глобальную безопасность для Store API
    // Только если publishableApiKey действительно была добавлена
    if (storeSpec.components.securitySchemes.publishableApiKey) {
        storeSpec.security = [{ publishableApiKey: [] }];
    }
        
    return storeSpec;
}
*/

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
  <link rel=\"stylesheet\" type=\"text/css\" href=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui.css\" />
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
    .topbar { 
        display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js\"></script>
  <script src=\"https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js\"></script>
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
      // Новый обработчик для /doc/store-swagger.json (напрямую из openapi (1).yaml)
      if (req.url?.endsWith("/store-swagger.json")) {
        if (fs.existsSync(frontendOpenApiPath)) {
          const yamlContent = fs.readFileSync(frontendOpenApiPath, 'utf-8');
          const storeSpec = yaml.load(yamlContent) as any;
          console.log(`Отдаем спецификацию из ${path.basename(frontendOpenApiPath)} как JSON.`);
          res.setHeader("Content-Type", "application/json");
          res.json(storeSpec);
        } else {
          console.warn(`Файл ${path.basename(frontendOpenApiPath)} не найден.`);
          res.status(404).send(`Not Found: ${path.basename(frontendOpenApiPath)}`);
        }
        return;
      }

      // Для /doc/swagger.json и /doc (Swagger UI) используем объединенную спецификацию
      // (openapi (2).yaml + аннотации)
      const finalSpec = getMergedSwaggerSpec(); 

      // Если запрашивается swagger.json, возвращаем полную объединенную спецификацию
      if (req.url?.endsWith("/swagger.json")) { 
        console.log("Отдаем объединенную спецификацию (полную) как JSON.");
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