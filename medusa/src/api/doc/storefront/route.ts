import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import path from "path"
import fs from "fs"
import yaml from 'js-yaml';

// Получаем путь к корневой директории проекта (предполагаем, что бэкенд запускается из папки medusa)
// Корректируем путь, чтобы подняться на уровень выше к корню проекта
const projectRoot = path.join(process.cwd(), '..');
const frontendOpenApiPath = path.join(projectRoot, 'openapi (1).yaml'); // Фронтенд спецификация

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

// --- Обработчик GET для /doc/storefront ---
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  console.log(`GET /doc/storefront: URL='${req.url}', OriginalURL='${req.originalUrl}', Path='${req.path}', Query='${JSON.stringify(req.query)}'`);

  try {
    // Case 1: Запрос для storefront swagger JSON (через query-параметр /doc/storefront?json=true)
    if (req.query && req.query.json === 'true') {
        console.log("Request for storefront swagger JSON for UI (/doc/storefront?json=true)");
        if (fs.existsSync(frontendOpenApiPath)) {
            const yamlContent = fs.readFileSync(frontendOpenApiPath, 'utf-8');
            const storeSpec = yaml.load(yamlContent) as any;

            // --- Начало модификации списка серверов ---
            const prodServerUrl = "http://89.108.110.26:9000";
            const prodServerDesc = "Production Ugodo Storefront API";

            let servers = storeSpec.servers || [];
            
            // Удаляем существующий prod сервер, если он есть, чтобы избежать дубликатов и поставить его первым
            servers = servers.filter(server => server.url !== prodServerUrl);
            
            // Добавляем/Обновляем prod сервер как первый элемент
            servers.unshift({ url: prodServerUrl, description: prodServerDesc });
            
            storeSpec.servers = servers;
            // --- Конец модификации списка серверов ---

            res.setHeader("Content-Type", "application/json");
            return res.json(storeSpec);
        } else {
            console.warn(`Frontend OpenAPI spec file not found: ${frontendOpenApiPath}`);
            return res.status(404).send(`Not Found: ${path.basename(frontendOpenApiPath)}`);
        }
    }

    // Case 2: Запрос HTML страницы Swagger UI для Storefront API (например, /doc/storefront)
    console.log("Request for Storefront Swagger UI HTML page (/doc/storefront)");
    const html = generateSwaggerUIHtmlForStorefront();
    res.setHeader("Content-Type", "text/html");
    return res.send(html);

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
  res.status(200).send()
} 