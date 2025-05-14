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
    let baseSpec: any = { openapi: '3.1.0', info: {}, servers: [], tags: [], paths: {}, components: { schemas: {}, securitySchemes: {} } };

    if (fs.existsSync(frontendOpenApiPath)) {
        try {
            const yamlContent = fs.readFileSync(frontendOpenApiPath, 'utf-8');
            baseSpec = yaml.load(yamlContent) as any;
            console.log(`Base storefront spec '${path.basename(frontendOpenApiPath)}' loaded successfully.`);
            // Убедимся, что ключевые поля существуют
            baseSpec.info = baseSpec.info || { title: "Ugodo Storefront API (Base)", version: "1.0.0" };
            baseSpec.components = baseSpec.components || {};
            baseSpec.components.schemas = baseSpec.components.schemas || {};
            baseSpec.components.securitySchemes = baseSpec.components.securitySchemes || {};
        } catch (e) {
            console.error(`Error loading or parsing base storefront spec '${frontendOpenApiPath}':`, e);
            baseSpec.info = { title: "Ugodo Storefront API (Error Loading Base)", version: "1.0.0" };
        }
    } else {
        console.warn(`Base storefront spec file not found: ${frontendOpenApiPath}. Using minimal base.`);
        baseSpec.info = { title: "Ugodo Storefront API (Base Missing)", version: "1.0.0" };
    }

    const apiKeySchemeName = "publishableApiKey";
    // Добавляем или перезаписываем схему для x-publishable-api-key, чтобы она точно была
    baseSpec.components.securitySchemes[apiKeySchemeName] = {
        type: "apiKey",
        in: "header",
        name: "x-publishable-api-key",
        description: "Publishable API Key for Storefront API access. Obtain from Medusa admin or environment variables."
    };

    const swaggerJsdocOptions: SwaggerJsdocOptionsType = {
        failOnErrors: true, // Останавливать при ошибках парсинга JSDoc
        definition: {
            openapi: baseSpec.openapi || "3.1.0",
            info: {
                title: baseSpec.info.title || "Ugodo Storefront API",
                version: baseSpec.info.version || "1.0.0",
                description: baseSpec.info.description || "API for Ugodo storefront.",
            },
            servers: baseSpec.servers && baseSpec.servers.length > 0 ? baseSpec.servers : [
                { url: "http://localhost:9000", description: "Local Development Server" },
                // Можно добавить другие серверы, если нужно
            ],
            components: {
                schemas: baseSpec.components.schemas,
                securitySchemes: baseSpec.components.securitySchemes,
            },
            security: [{ [apiKeySchemeName]: [] }] // Применяем publishableApiKey глобально ко всем эндпоинтам
        },
        apis: [
            // Пути для сканирования JSDoc аннотаций стандартных storefront роутов и моделей Medusa
            path.join(rootDir, 'src/api/routes/store/**/route.ts'),
            path.join(rootDir, 'src/models/**/*.ts'),
            path.join(rootDir, 'src/modules/**/models/**/*.ts'), // Если у вас есть модели в кастомных модулях
            // path.join(rootDir, 'src/api/routes/store/**/*.yaml'), // Если есть yaml файлы с описаниями
        ],
    };

    let finalSpec = swaggerJSDoc(swaggerJsdocOptions);
    console.log("JSDoc spec generated for storefront. Paths found from JSDoc:", Object.keys(finalSpec.paths || {}).length);

    // Слияние путей: JSDoc из сканируемых файлов должен иметь приоритет или дополнять baseSpec
    finalSpec.paths = { ...(baseSpec.paths || {}), ...finalSpec.paths };
    
    // Слияние тегов
    if (baseSpec.tags && Array.isArray(baseSpec.tags)) {
        finalSpec.tags = finalSpec.tags || [];
        const finalTagNames = new Set(finalSpec.tags.map((tag: any) => tag.name));
        baseSpec.tags.forEach((tag: any) => {
            if (!finalTagNames.has(tag.name)) {
                finalSpec.tags.push(tag);
            }
        });
    }
    if (finalSpec.tags && Array.isArray(finalSpec.tags)) {
      finalSpec.tags.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

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