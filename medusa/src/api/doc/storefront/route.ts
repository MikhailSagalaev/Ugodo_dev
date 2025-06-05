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
const perseidesOtpPath = path.join(rootDir, 'src/api/doc/storefront/perseides-otp.yaml');

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
    if (fs.existsSync(frontendOpenApiPath)) {
        try {
            const yamlContent = fs.readFileSync(frontendOpenApiPath, 'utf-8');
            yamlSpec = yaml.load(yamlContent) as any;
            if (typeof yamlSpec !== 'object' || yamlSpec === null || !yamlSpec.openapi) {
                yamlSpec = {};
            }
        } catch (e) {
            yamlSpec = {};
        }
    }

    // --- Загрузка спецификации Perseides OTP ---
    let otpSpec: any = {};
    if (fs.existsSync(perseidesOtpPath)) {
        try {
            const otpContent = fs.readFileSync(perseidesOtpPath, 'utf-8');
            otpSpec = yaml.load(otpContent) as any;
            if (typeof otpSpec !== 'object' || otpSpec === null || !otpSpec.openapi) {
                otpSpec = {};
            }
        } catch (e) {
            otpSpec = {};
        }
    }

    // --- Инициализация базовой спецификации для JSDoc --- 
    // Эта спецификация будет основой, в которую jsdoc добавит свои находки.
    // Мы не будем брать info, servers из yamlSpec, чтобы контролировать их из кода.
    let jsdocBaseDefinition: any = {
      openapi: yamlSpec.openapi || "3.1.0",
      info: {
        title: "Ugodo Storefront API (Generated)",
        version: "1.0.0",
        description: "Combined API documentation for Ugodo storefront."
      },
      servers: yamlSpec.servers && yamlSpec.servers.length > 0 ? yamlSpec.servers : [],
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
      paths: { ...(yamlSpec.paths || {}) },
      tags: yamlSpec.tags || [],
    };

    // --- Объединяем спецификацию Perseides OTP ---
    if (otpSpec && otpSpec.paths) {
      jsdocBaseDefinition.paths = { ...jsdocBaseDefinition.paths, ...otpSpec.paths };
    }
    if (otpSpec && otpSpec.components) {
      for (const compKey of Object.keys(otpSpec.components)) {
        jsdocBaseDefinition.components[compKey] = {
          ...(jsdocBaseDefinition.components[compKey] || {}),
          ...otpSpec.components[compKey],
        };
      }
    }
    if (otpSpec && otpSpec.tags) {
      const tagNames = new Set((jsdocBaseDefinition.tags || []).map((t: any) => t.name));
      for (const tag of otpSpec.tags) {
        if (!tagNames.has(tag.name)) {
          jsdocBaseDefinition.tags.push(tag);
        }
      }
    }

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

    // Находим место где yamlSpec или jsdocBaseDefinition содержит tags и добавляем новый тег
    if (!jsdocBaseDefinition.tags) {
        jsdocBaseDefinition.tags = [];
    }

    // Добавляем тег для OTP авторизации, если его еще нет
    const otpTagName = "Customer OTP Auth";
    if (!jsdocBaseDefinition.tags.some(tag => tag.name === otpTagName)) {
        jsdocBaseDefinition.tags.push({
            name: otpTagName,
            description: "Operations related to customer authentication using One-Time Passwords (OTP)"
        });
    }

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
            // Добавляем новые пути для OTP API
            path.join(rootDir, 'src/api/routes/store/auth/customer/otp/*.ts'),
            // Оставляем пути к плагину OTP
            path.join(rootDir, '../node_modules/@perseidesjs/auth-otp/dist/api/routes/customer/**/*.js'),
            path.join(rootDir, '../node_modules/@perseidesjs/auth-otp/dist/api/routes/customer/**/*.ts'),
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

// --- Обработчик OPTIONS для CORS ---
export const OPTIONS = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Устанавливаем CORS заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-publishable-api-key');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 часа
  
  // Отправляем успешный ответ для preflight запросов
  res.status(200).end();
} 