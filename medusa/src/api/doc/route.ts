import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import path from "path"
import fs from "fs"

// Определяем спецификацию Swagger на глобальном уровне
const rootDir = process.cwd()

// Определяем базовую спецификацию Swagger
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Medusa Commerce API",
    version: "2.0.0",
    description: "Документация API для Medusa Commerce",
  },
  servers: [
    {
      url: "http://localhost:9000",
      description: "Локальный сервер разработки"
    }
  ],
  tags: [
    { 
      name: "Authentication", 
      description: "Аутентификация пользователей и администраторов"
    },
    { 
      name: "Products", 
      description: "Управление товарами и вариантами"
    },
    { 
      name: "Collections", 
      description: "Управление коллекциями товаров"
    },
    { 
      name: "Categories", 
      description: "Управление категориями товаров"
    },
    { 
      name: "Customers", 
      description: "Управление клиентами"
    },
    { 
      name: "Carts", 
      description: "Управление корзинами"
    },
    { 
      name: "Orders", 
      description: "Управление заказами"
    },
    { 
      name: "Shipping", 
      description: "Управление доставкой"
    },
    { 
      name: "Payment", 
      description: "Управление оплатой"
    },
    { 
      name: "Returns", 
      description: "Управление возвратами"
    },
    { 
      name: "Discounts", 
      description: "Управление скидками"
    },
    { 
      name: "Gift Cards", 
      description: "Управление подарочными картами"
    },
    { 
      name: "Regions", 
      description: "Управление регионами"
    },
    { 
      name: "Tax", 
      description: "Управление налогами"
    },
    { 
      name: "Shipping Profiles", 
      description: "Управление профилями доставки"
    },
    { 
      name: "Price Lists", 
      description: "Управление ценовыми списками"
    },
    { 
      name: "Reviews", 
      description: "Управление отзывами о товарах"
    },
    { 
      name: "API Documentation", 
      description: "API для получения документации" 
    },
    {
      name: "Example",
      description: "Примеры API для тестирования"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "connect.sid",
      },
      publishableApiKey: {
        type: "apiKey",
        in: "header",
        name: "x-publishable-api-key",
      },
    },
    schemas: {
      // Базовая схема для Product
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          handle: { type: "string" },
          thumbnail: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      },
      // Базовая схема для Customer
      Customer: {
        type: "object",
        properties: {
          id: { type: "string" },
          email: { type: "string" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          billing_address: { type: "object" },
          shipping_addresses: { type: "array", items: { type: "object" } },
          phone: { type: "string" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" }
        }
      }
    }
  },
}

// Определяем пути для поиска файлов JSDoc аннотаций
const options = {
  swaggerDefinition,
  apis: [
    path.join(rootDir, "src/modules/review/api/routes/*.ts"),
    path.join(rootDir, "src/modules/review/models/*.ts"),
    path.join(rootDir, "medusa/src/api/**/*.ts"),
  ],
}

// Генерируем спецификацию
const swaggerSpec = swaggerJSDoc(options)

/**
 * @swagger
 * /doc:
 *   get:
 *     summary: Получить документацию API
 *     tags: [API Documentation]
 *     responses:
 *       200:
 *         description: Успешный ответ с документацией API
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  // Проверяем, запрашивается ли JSON спецификация
  if (req.url.endsWith("/swagger.json")) {
    res.setHeader("Content-Type", "application/json")
    res.json(swaggerSpec)
    return
  }

  // Добавляем стандартные пути Medusa, если ничего не найдено или нужно дополнить
  if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length < 5) {
    console.log("Добавляем стандартные пути Medusa API")
    
    // Основные пути для Store API
    swaggerSpec.paths = {
      ...swaggerSpec.paths,
      
      // Auth & Registration
      "/auth/customer/emailpass/register": {
        post: {
          tags: ["Authentication"],
          summary: "Получить токен регистрации клиента",
          description: "Этот эндпоинт возвращает JWT токен, который используется для последующей регистрации клиента через /store/customers",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      description: "Email адрес клиента"
                    },
                    password: {
                      type: "string",
                      description: "Пароль клиента"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Успешное получение токена регистрации",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: {
                        type: "string",
                        description: "JWT токен для регистрации"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      "/auth/customer/emailpass": {
        post: {
          tags: ["Authentication"],
          summary: "Аутентификация клиента по email и паролю",
          description: "Аутентифицирует клиента и возвращает JWT токен для доступа к API",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      description: "Email адрес клиента"
                    },
                    password: {
                      type: "string",
                      description: "Пароль клиента"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Успешная аутентификация",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      access_token: {
                        type: "string",
                        description: "JWT токен доступа"
                      },
                      refresh_token: {
                        type: "string",
                        description: "JWT токен для обновления access_token"
                      },
                      expires_in: {
                        type: "integer",
                        description: "Время жизни токена в секундах"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // Store Auth
      "/store/auth": {
        post: {
          tags: ["Authentication"],
          summary: "Аутентификация клиента",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email"
                    },
                    password: {
                      type: "string"
                    }
                  }
                }
              }
            }
          },
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Успешная аутентификация",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      customer: {
                        type: "object"
                      },
                      token: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      // Products
      "/store/products": {
        get: {
          tags: ["Products"],
          summary: "Получение списка товаров",
          parameters: [
            {
              in: "query",
              name: "q",
              schema: {
                type: "string"
              },
              description: "Поисковый запрос"
            },
            {
              in: "query",
              name: "collection_id",
              schema: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              description: "ID коллекции для фильтрации товаров"
            },
            {
              in: "query",
              name: "category_id",
              schema: {
                type: "array",
                items: {
                  type: "string"
                }
              },
              description: "ID категории для фильтрации товаров"
            },
            {
              in: "query",
              name: "limit",
              schema: {
                type: "integer",
                default: 100
              },
              description: "Лимит товаров на странице"
            },
            {
              in: "query",
              name: "offset",
              schema: {
                type: "integer",
                default: 0
              },
              description: "Смещение для пагинации"
            }
          ],
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Успешный ответ со списком товаров",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: {
                          type: "object"
                        }
                      },
                      count: {
                        type: "integer"
                      },
                      offset: {
                        type: "integer"
                      },
                      limit: {
                        type: "integer"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      "/store/products/{id}": {
        get: {
          tags: ["Products"],
          summary: "Получение товара по ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID товара"
            }
          ],
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Успешный ответ с данными товара",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      product: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      // Customers
      "/store/customers": {
        post: {
          tags: ["Customers"],
          summary: "Создать нового клиента",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "first_name", "last_name", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email"
                    },
                    first_name: {
                      type: "string"
                    },
                    last_name: {
                      type: "string"
                    },
                    password: {
                      type: "string"
                    },
                    phone: {
                      type: "string"
                    }
                  }
                }
              }
            }
          },
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Успешное создание клиента",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      customer: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      "/store/customers/me": {
        get: {
          tags: ["Customers"],
          summary: "Получить данные текущего клиента",
          security: [
            { publishableApiKey: [] },
            { bearerAuth: [] }
          ],
          responses: {
            "200": {
              description: "Успешный ответ с данными клиента",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      customer: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      // Carts
      "/store/carts": {
        post: {
          tags: ["Carts"],
          summary: "Создать новую корзину",
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Успешное создание корзины",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      cart: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      "/store/carts/{id}": {
        get: {
          tags: ["Carts"],
          summary: "Получить данные корзины по ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID корзины"
            }
          ],
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Успешный ответ с данными корзины",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      cart: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      "/store/carts/{id}/line-items": {
        post: {
          tags: ["Carts"],
          summary: "Добавить товар в корзину",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID корзины"
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["variant_id", "quantity"],
                  properties: {
                    variant_id: {
                      type: "string"
                    },
                    quantity: {
                      type: "integer",
                      minimum: 1
                    }
                  }
                }
              }
            }
          },
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Успешное добавление товара в корзину",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      cart: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      // Orders
      "/store/orders": {
        get: {
          tags: ["Orders"],
          summary: "Получить заказы текущего клиента",
          security: [
            { publishableApiKey: [] },
            { bearerAuth: [] }
          ],
          responses: {
            "200": {
              description: "Успешный ответ со списком заказов",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      orders: {
                        type: "array",
                        items: {
                          type: "object"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      "/store/orders/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Получить данные заказа по ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID заказа"
            }
          ],
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Успешный ответ с данными заказа",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      order: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      // Admin API
      "/admin/auth": {
        post: {
          tags: ["Authentication"],
          summary: "Аутентификация администратора",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email"
                    },
                    password: {
                      type: "string"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Успешная аутентификация администратора",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object"
                      },
                      token: {
                        type: "string"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      
      "/admin/products": {
        get: {
          tags: ["Products"],
          summary: "Получить список товаров (админ)",
          security: [
            { bearerAuth: [] }
          ],
          responses: {
            "200": {
              description: "Успешный ответ со списком товаров",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: {
                          type: "object"
                        }
                      },
                      count: {
                        type: "integer"
                      },
                      offset: {
                        type: "integer"
                      },
                      limit: {
                        type: "integer"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Products"],
          summary: "Создать новый товар",
          security: [
            { bearerAuth: [] }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: {
                      type: "string"
                    },
                    subtitle: {
                      type: "string"
                    },
                    description: {
                      type: "string"
                    },
                    handle: {
                      type: "string"
                    },
                    status: {
                      type: "string",
                      enum: ["draft", "proposed", "published", "rejected"]
                    },
                    thumbnail: {
                      type: "string"
                    },
                    categories: {
                      type: "array",
                      items: {
                        type: "string"
                      }
                    },
                    variants: {
                      type: "array",
                      items: {
                        type: "object"
                      }
                    },
                    collection_id: {
                      type: "string"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Успешное создание товара",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      product: {
                        type: "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Добавляем тестовые эндпоинты
  swaggerSpec.paths["/doc/example"] = {
    get: {
      tags: ["Example"],
      summary: "Тестовый маршрут для проверки Swagger",
      responses: {
        "200": {
          description: "Успешный ответ для тестирования",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  swaggerSpec.paths["/hello-world"] = {
    get: {
      tags: ["Example"],
      summary: "Простой приветственный API метод",
      responses: {
        "200": {
          description: "Успешный ответ с приветствием",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      }
    },
    post: {
      tags: ["Example"],
      summary: "Отправить приветственное сообщение",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string"
                }
              }
            }
          }
        }
      },
      responses: {
        "200": {
          description: "Успешная отправка приветствия",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Генерируем HTML для Swagger UI
  const html = generateSwaggerUIHtml()
  
  // Устанавливаем правильный Content-Type для HTML
  res.setHeader("Content-Type", "text/html")
  res.send(html)
}

export const OPTIONS = () => {
  return new Response("", { status: 204 })
}

// Обрабатываем GET запрос для отображения Swagger UI
export const GET_SWAGGER_UI = (req: MedusaRequest, res: MedusaResponse) => {
  if (req.url.endsWith("/swagger.json")) {
    res.setHeader("Content-Type", "application/json")
    res.json(swaggerSpec)
    return
  }

  res.setHeader("Content-Type", "text/html")
  res.send(generateSwaggerUIHtml())
}

// Функция для генерации HTML страницы Swagger UI
function generateSwaggerUIHtml() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Medusa API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    #swagger-ui {
      margin: 0;
      padding: 0;
    }
    .topbar {
      background-color: #3b5998;
      padding: 15px 20px;
    }
    .topbar-wrapper a {
      color: white;
      text-decoration: none;
      font-weight: bold;
      font-size: 1.5em;
    }
    .download-section {
      padding: 15px 20px;
      background: #1b1b1b;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .download-section h2 {
      margin: 0;
      font-size: 1.2em;
    }
    .download-links {
      display: flex;
      gap: 10px;
    }
    .download-link {
      color: #4990e2;
      text-decoration: none;
      background-color: white;
      padding: 8px 15px;
      border-radius: 4px;
      font-weight: bold;
    }
    .download-link:hover {
      background-color: #f0f0f0;
    }
  </style>
</head>
<body>
  <div class="download-section">
    <h2>Medusa OpenAPI спецификации</h2>
    <div class="download-links">
      <a href="/doc/swagger.json" class="download-link" download="medusa-api.json">Скачать полную спецификацию</a>
      <a href="/openapi/reviews" class="download-link" download="reviews-api.json">Спецификация отзывов</a>
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      // Определение URL для swagger.json
      const url = window.location.protocol + '//' + window.location.host + '/doc/swagger.json';
      
      // Инициализация Swagger UI
      window.ui = SwaggerUIBundle({
        url: url,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout",
        defaultModelsExpandDepth: -1,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
        tagsSorter: 'alpha',
        docExpansion: 'list',
        showExtensions: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'],
        validatorUrl: null,
        plugins: [
          function(system) {
            return {
              statePlugins: {
                spec: {
                  wrapSelectors: {
                    allowTryItOutFor: () => () => true
                  }
                }
              }
            }
          }
        ]
      });
    };
  </script>
</body>
</html>
  `;
}

// Экспортируем JSON-версию спецификации для использования в инструментах
export const getSwaggerSpec = () => swaggerSpec 