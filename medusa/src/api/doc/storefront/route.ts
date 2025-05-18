import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import path from "path"
import fs from "fs"
import yaml from 'js-yaml';
import swaggerJSDoc, { type Options as SwaggerJsdocOptionsType } from "swagger-jsdoc";

// Получаем путь к корневой директории проекта (предполагаем, что бэкенд запускается из папки medusa)
// Корректируем путь, чтобы подняться на уровень выше к корню проекта
const projectRoot = path.join(process.cwd(), '..');
const frontendOpenApiPath = path.join(projectRoot, 'openapi (1).yaml'); // Фронтенд спецификация
const rootDir = process.cwd(); // Текущая директория (medusa/)

// --- Функция для генерации HTML для Storefront API ---
const generateSwaggerUIHtmlForStorefront = () => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Medusa Storefront API Documentation" />
  <title>Medusa Storefront API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
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
    /* .topbar { 
        display: none;
    } */ 
  </style>
</head>
<body>
  <div id="swagger-ui-storefront"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.uiStorefront = SwaggerUIBundle({
        url: "?json=true", // Загружаем спецификацию с текущего пути /doc/storefront?json=true
        dom_id: '#swagger-ui-storefront',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        tagsSorter: "alpha",
        operationsSorter: "alpha",
        docExpansion: "none",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        displayRequestDuration: true
      });
    };
  </script>
</body>
</html>
  `;
}

const generateStorefrontSwaggerUIHtml = (jsonUrl: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Ugodo Storefront API Documentation" />
  <title>Ugodo Storefront API</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  <style> html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; } *, *:before, *:after { box-sizing: inherit; } body { margin: 0; background: #fafafa; } </style>
</head>
<body>
  <div id="swagger-ui-storefront"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.uiStorefront = SwaggerUIBundle({
        url: "${jsonUrl}",
        dom_id: '#swagger-ui-storefront',
        deepLinking: true,
        presets: [ SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset ],
        plugins: [ SwaggerUIBundle.plugins.DownloadUrl ],
        layout: "StandaloneLayout",
        tagsSorter: "alpha",
        operationsSorter: "alpha",
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        displayRequestDuration: true,
        // Конфигурация для автоматической подстановки x-publishable-api-key
        // Важно: Swagger UI сам по себе не хранит ключ между сессиями без кастомных плагинов
        // Пользователю нужно будет нажать "Authorize" и ввести ключ
        // Но мы обеспечим, чтобы поле для ключа было
      });
    };
  </script>
</body>
</html>
  `;
};

const getStorefrontSwaggerSpec = () => {
    // --- Загрузка базовой спецификации из YAML (если есть) ---
    let yamlSpec: any = {};
    // ЗАКОММЕНТИРУЕМ ЗАГРУЗКУ ВНЕШНЕГО YAML, ЧТОБЫ ВРЕМЕННО ЕГО НЕ ПОКАЗЫВАТЬ
    /*
    if (fs.existsSync(frontendOpenApiPath)) {
        try {
            const yamlContent = fs.readFileSync(frontendOpenApiPath, 'utf-8');
            yamlSpec = yaml.load(yamlContent) as any;
            console.log(`Successfully loaded and parsed external OpenAPI spec: ${frontendOpenApiPath}`);
            // Базовая валидация, что это похоже на OpenAPI объект
            if (typeof yamlSpec !== 'object' || yamlSpec === null || !yamlSpec.openapi) {
                console.warn(`Warning: Loaded YAML from ${frontendOpenApiPath} does not seem to be a valid OpenAPI spec. It will be ignored.`);
                yamlSpec = {}; // Сбрасываем, если невалидно
            }
        } catch (e) {
            console.error(`Error loading or parsing external OpenAPI spec '${frontendOpenApiPath}':`, e);
            yamlSpec = {}; // Сбрасываем при ошибке
        }
    } else {
        console.warn(`External OpenAPI spec file not found: ${frontendOpenApiPath}. It will be ignored.`);
    }
    */

    // --- Инициализация базовой спецификации для JSDoc --- 
    // Эта спецификация будет основой, в которую jsdoc добавит свои находки.
    // Мы не будем брать info, servers из yamlSpec, чтобы контролировать их из кода.
    let jsdocBaseDefinition: any = {
      openapi: yamlSpec.openapi || "3.1.0", // Берем версию OpenAPI из YAML или дефолт
      info: {
        title: "Ugodo Storefront API (Generated)", // Это будет перезаписано swaggerJsdocOptions
        version: "1.0.0",
        description: "Combined API documentation for Ugodo storefront."
      },
      servers: yamlSpec.servers && yamlSpec.servers.length > 0 ? yamlSpec.servers : [], // Серверы из YAML или пустой массив
      // Компоненты из YAML будут использованы как основа
      components: {
        schemas: { ...(yamlSpec.components?.schemas || {}) },
        securitySchemes: { ...(yamlSpec.components?.securitySchemes || {}) },
        requestBodies: { ...(yamlSpec.components?.requestBodies || {}) },
        responses: { ...(yamlSpec.components?.responses || {}) },
        parameters: { ...(yamlSpec.components?.parameters || {}) },
        examples: { ...(yamlSpec.components?.examples || {}) },
        headers: { ...(yamlSpec.components?.headers || {}) },
        links: { ...(yamlSpec.components?.links || {}) },
        callbacks: { ...(yamlSpec.components?.callbacks || {}) },
      },
      // Пути из YAML будут использованы как основа
      paths: { ...(yamlSpec.paths || {}) },
      // Теги из YAML будут использованы как основа
      tags: yamlSpec.tags || [],
      // Глобальная безопасность из YAML пока не берем, jsdoc определит свою
    };

    const apiKeySchemeName = "publishableApiKey";
    // Добавляем или перезаписываем схему для x-publishable-api-key, чтобы она точно была
    // Это важно, так как JSDoc-аннотации могут полагаться на эту схему.
    jsdocBaseDefinition.components.securitySchemes = {
      ...jsdocBaseDefinition.components.securitySchemes,
      [apiKeySchemeName]: {
          type: "apiKey",
          in: "header",
          name: "x-publishable-api-key",
          description: "Publishable API Key for Storefront API access. Obtain from Medusa admin or environment variables."
      }
    };

    const swaggerJsdocOptions: SwaggerJsdocOptionsType = {
        failOnErrors: true, 
        definition: { // Это определение перезапишет/дополнит jsdocBaseDefinition при генерации swaggerJSDoc
            openapi: jsdocBaseDefinition.openapi, // Используем версию из jsdocBaseDefinition
            info: { // Определяем info здесь, оно будет главным
                title: "Ugodo Storefront API", 
                version: "1.0.1", // Можно обновлять версию при изменениях
                description: "Combined API documentation for Ugodo storefront from JSDoc and external YAML file.",
            },
            servers: jsdocBaseDefinition.servers.length > 0 ? jsdocBaseDefinition.servers : [
                { url: "http://localhost:9000", description: "Local Development Server" },
            ],
            // Компоненты: jsdoc будет добавлять свои поверх тех, что уже есть в jsdocBaseDefinition.components
            components: jsdocBaseDefinition.components, 
            // Пути: jsdoc будет добавлять свои поверх тех, что уже есть в jsdocBaseDefinition.paths
            paths: jsdocBaseDefinition.paths,
            // Теги: jsdoc будет добавлять свои поверх тех, что уже есть в jsdocBaseDefinition.tags
            tags: jsdocBaseDefinition.tags, 
            security: [{ [apiKeySchemeName]: [] }] // Применяем publishableApiKey глобально ко всем эндпоинтам
        },
        apis: [
            // Пути для сканирования JSDoc аннотаций
            path.join(rootDir, 'src/api/routes/store/**/*.ts'), 
            path.join(rootDir, 'src/models/**/*.ts'),             
            path.join(rootDir, 'src/modules/**/models/**/*.ts'),  
            path.join(rootDir, 'src/modules/**/api/routes/store/**/*.ts'), 
            // Добавляем путь к маршрутам плагина OTP для storefront (customer)
            path.join(rootDir, '../node_modules/@perseidesjs/auth-otp/dist/api/routes/customer/**/*.js'), // Возвращаем .js, т.к. плагины обычно компилируются
            path.join(rootDir, '../node_modules/@perseidesjs/auth-otp/dist/api/routes/customer/**/*.ts'), // Оставляем и .ts на всякий случай
            // path.join(rootDir, 'src/modules/auth-phone-otp/service.ts'), // Удаляем путь к старому сервису
        ],
    };

    console.log("Swagger JSDoc Options APIS:", swaggerJsdocOptions.apis); // Временный лог
    let finalSpec = swaggerJSDoc(swaggerJsdocOptions);
    console.log("JSDoc spec generated. Paths found from JSDoc processing (before merge with initial YAML paths):", Object.keys(finalSpec.paths || {}).length);
    console.log("Total paths after JSDoc processing (includes initial YAML paths):", Object.keys(finalSpec.paths || {}).length);

    // --- Финальное слияние тегов (на случай, если swaggerJSDoc не идеально их смержил) ---
    // Убедимся, что все теги из yamlSpec (если они не были добавлены JSDoc) присутствуют,
    // и удалим дубликаты.
    const mergedTags = [...(finalSpec.tags || [])];
    const mergedTagNames = new Set(mergedTags.map(tag => tag.name));

    if (Array.isArray(yamlSpec.tags)) {
        yamlSpec.tags.forEach((yamlTag: any) => {
            if (yamlTag && yamlTag.name && !mergedTagNames.has(yamlTag.name)) {
                mergedTags.push(yamlTag);
                mergedTagNames.add(yamlTag.name);
            }
        });
    }
    finalSpec.tags = mergedTags.sort((a: any, b: any) => a.name.localeCompare(b.name));

    return finalSpec;
};

// --- Обработчик GET для /doc/storefront ---
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  console.log(`GET /doc/storefront: URL='${req.url}', OriginalURL='${req.originalUrl}', Path='${req.path}', Query='${JSON.stringify(req.query)}'`);

  try {
    const { json } = req.query;
    const swaggerJsonUrl = "/doc/storefront?json=true";

    if (json === 'true') {
        try {
            const spec = getStorefrontSwaggerSpec();
            return res.json(spec);
        } catch (error) {
            console.error("Error generating Storefront Swagger JSON:", error);
            return res.status(500).send("Error generating Storefront Swagger JSON specification.");
        }
    } else {
        const html = generateStorefrontSwaggerUIHtml(swaggerJsonUrl);
        return res.send(html);
    }

  } catch(error) {
       console.error("Критическая ошибка в обработчике GET /doc/storefront:", error);
       return res.status(500).send("Internal Server Error while generating Storefront API documentation.");
  }
}

// Обработчик OPTIONS запроса (для CORS)
export const OPTIONS = (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Разрешаем GET и OPTIONS
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-publishable-api-key');
  res.status(204).send();
} 