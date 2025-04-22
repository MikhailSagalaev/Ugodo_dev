import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import swaggerJSDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import path from "path"
import fs from "fs"

// Получаем путь к корневой директории проекта
const rootDir = process.cwd()

// Базовое определение swagger
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Medusa Commerce API",
    version: "2.0.0",
    description: "API для работы с электронной коммерцией на базе Medusa",
    license: {
      name: "MIT",
      url: "https://github.com/medusajs/medusa/blob/master/LICENSE"
    },
    contact: {
      name: "Medusa",
      url: "https://medusajs.com",
      email: "hello@medusajs.com"
    }
  },
  servers: [
    {
      url: "http://localhost:9000",
      description: "Development server"
    }
  ],
  tags: [
    {
      name: "Authentication",
      description: "Эндпоинты для аутентификации клиентов и администраторов"
    },
    {
      name: "Products",
      description: "Эндпоинты для работы с товарами"
    },
    {
      name: "Collections",
      description: "Эндпоинты для работы с коллекциями"
    },
    {
      name: "Categories",
      description: "Эндпоинты для работы с категориями"
    },
    {
      name: "Customers",
      description: "Эндпоинты для работы с клиентами"
    },
    {
      name: "Carts",
      description: "Эндпоинты для работы с корзинами"
    },
    {
      name: "Orders",
      description: "Эндпоинты для работы с заказами"
    },
    {
      name: "Shipping",
      description: "Эндпоинты для работы с доставкой"
    },
    {
      name: "Payment",
      description: "Эндпоинты для работы с платежами"
    },
    {
      name: "Returns",
      description: "Эндпоинты для работы с возвратами"
    },
    {
      name: "Discounts",
      description: "Эндпоинты для работы со скидками"
    },
    {
      name: "Reviews",
      description: "Эндпоинты для работы с отзывами о товарах"
    },
    {
      name: "Cache",
      description: "Демонстрация работы кеша"
    },
    {
      name: "Example",
      description: "Пример API эндпоинта"
    }
  ]
}

// Параметры для swagger-jsdoc
const options = {
  swaggerDefinition,
  apis: [
    path.join(rootDir, "src/modules/review/api/routes/*.ts"),
    path.join(rootDir, "src/modules/review/models/*.ts"),
    path.join(rootDir, "medusa/src/api/**/*.ts")
  ]
}

// Генерация спецификации
const swaggerSpec = swaggerJSDoc(options)

// Добавление демонстрационного эндпоинта, если нет путей
if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
  swaggerSpec.paths = {
    "/doc/example": {
      get: {
        tags: ["Example"],
        summary: "Пример GET запроса",
        description: "Это демонстрационный эндпоинт, показывающий работу API",
        responses: {
          200: {
            description: "Успешный ответ",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "Hello from API Example!"
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

// Добавление кастомных эндпоинтов для документации
swaggerSpec.paths = {
  ...swaggerSpec.paths,
  "/auth/customer/emailpass/register": {
    post: {
      tags: ["Authentication"],
      summary: "Получить токен регистрации клиента",
      description: "Создает токен регистрации для нового клиента, который затем используется для регистрации клиента",
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
                  example: "customer@example.com"
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "supersecret"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Токен регистрации получен успешно",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
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
  "/auth/customer/emailpass": {
    post: {
      tags: ["Authentication"],
      summary: "Аутентификация клиента по email и паролю",
      description: "Аутентифицирует клиента по email и паролю и возвращает JWT токен",
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
                  example: "customer@example.com"
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "supersecret"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Успешная аутентификация",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: {
                    type: "string"
                  },
                  user: {
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
  "/auth/customer/sms/request": {
    post: {
      tags: ["Authentication"],
      summary: "Запросить код подтверждения по SMS",
      description: "Отправляет SMS с кодом подтверждения на указанный номер телефона",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["phone"],
              properties: {
                phone: {
                  type: "string",
                  description: "Номер телефона в международном формате",
                  example: "+79991234567"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "SMS успешно отправлено",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true
                  },
                  request_id: {
                    type: "string",
                    description: "Идентификатор запроса, используется при верификации"
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Неверный формат номера телефона или другая ошибка",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false
                  },
                  message: {
                    type: "string",
                    example: "Неверный формат номера телефона"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/auth/customer/sms/verify": {
    post: {
      tags: ["Authentication"],
      summary: "Верификация кода из SMS",
      description: "Проверяет код подтверждения, полученный по SMS, и аутентифицирует пользователя",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["request_id", "code"],
              properties: {
                request_id: {
                  type: "string",
                  description: "Идентификатор запроса, полученный при отправке SMS"
                },
                code: {
                  type: "string",
                  description: "Код подтверждения из SMS",
                  example: "123456"
                },
                create_account: {
                  type: "boolean",
                  description: "Создать новый аккаунт, если пользователь не найден",
                  default: false
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Код подтверждения верный, пользователь аутентифицирован",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true
                  },
                  token: {
                    type: "string",
                    description: "JWT токен для аутентификации"
                  },
                  user: {
                    type: "object",
                    description: "Информация о пользователе"
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Неверный код или другая ошибка",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false
                  },
                  message: {
                    type: "string",
                    example: "Неверный код подтверждения"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/store/products": {
    get: {
      tags: ["Products"],
      summary: "Получить список товаров",
      description: "Возвращает список товаров с возможностью фильтрации и пагинации",
      parameters: [
        {
          name: "limit",
          in: "query",
          description: "Количество товаров на странице",
          schema: {
            type: "integer",
            default: 10
          }
        },
        {
          name: "offset",
          in: "query",
          description: "Смещение для пагинации",
          schema: {
            type: "integer",
            default: 0
          }
        },
        {
          name: "q",
          in: "query",
          description: "Поисковый запрос для фильтрации товаров по названию или описанию",
          schema: {
            type: "string"
          }
        },
        {
          name: "collection_id",
          in: "query",
          description: "ID коллекции для фильтрации товаров",
          schema: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        {
          name: "category_id",
          in: "query",
          description: "ID категории для фильтрации товаров",
          schema: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        {
          name: "is_popular",
          in: "query",
          description: "Фильтр для получения популярных товаров (имеющих больше всего заказов)",
          schema: {
            type: "boolean"
          }
        },
        {
          name: "is_new",
          in: "query",
          description: "Фильтр для получения новых товаров (недавно добавленных)",
          schema: {
            type: "boolean"
          }
        },
        {
          name: "order",
          in: "query",
          description: "Сортировка товаров (например, 'created_at' для новинок или 'sales' для популярных)",
          schema: {
            type: "string",
            enum: ["created_at", "-created_at", "sales", "-sales", "price", "-price", "title", "-title"]
          }
        },
        {
          name: "x-publishable-api-key",
          in: "header",
          description: "Publishable API ключ",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Список товаров",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "Уникальный идентификатор товара"
                        },
                        title: {
                          type: "string",
                          description: "Название товара"
                        },
                        description: {
                          type: "string",
                          description: "Описание товара"
                        },
                        handle: {
                          type: "string",
                          description: "URL-дружественный идентификатор товара"
                        },
                        thumbnail: {
                          type: "string",
                          description: "URL миниатюры товара"
                        },
                        variants: {
                          type: "array",
                          description: "Варианты товара",
                          items: {
                            type: "object"
                          }
                        },
                        prices: {
                          type: "array",
                          description: "Цены товара",
                          items: {
                            type: "object"
                          }
                        },
                        created_at: {
                          type: "string",
                          format: "date-time",
                          description: "Дата создания товара"
                        },
                        updated_at: {
                          type: "string",
                          format: "date-time",
                          description: "Дата последнего обновления товара"
                        }
                      }
                    }
                  },
                  count: {
                    type: "integer",
                    description: "Общее количество товаров, соответствующих запросу"
                  },
                  offset: {
                    type: "integer",
                    description: "Смещение для пагинации"
                  },
                  limit: {
                    type: "integer",
                    description: "Количество товаров на странице"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/store/products/popular": {
    get: {
      tags: ["Products"],
      summary: "Получить список популярных товаров",
      description: "Возвращает список популярных товаров с пагинацией (товары с наибольшим количеством заказов)",
      parameters: [
        {
          name: "limit",
          in: "query",
          description: "Количество товаров на странице",
          schema: {
            type: "integer",
            default: 10
          }
        },
        {
          name: "offset",
          in: "query",
          description: "Смещение для пагинации",
          schema: {
            type: "integer",
            default: 0
          }
        },
        {
          name: "category_id",
          in: "query",
          description: "ID категории для фильтрации товаров",
          schema: {
            type: "string"
          }
        },
        {
          name: "x-publishable-api-key",
          in: "header",
          description: "Publishable API ключ",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Список популярных товаров",
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
  "/store/products/new": {
    get: {
      tags: ["Products"],
      summary: "Получить список новинок",
      description: "Возвращает список новых товаров с пагинацией (недавно добавленные товары)",
      parameters: [
        {
          name: "limit",
          in: "query",
          description: "Количество товаров на странице",
          schema: {
            type: "integer",
            default: 10
          }
        },
        {
          name: "offset",
          in: "query",
          description: "Смещение для пагинации",
          schema: {
            type: "integer",
            default: 0
          }
        },
        {
          name: "category_id",
          in: "query",
          description: "ID категории для фильтрации товаров",
          schema: {
            type: "string"
          }
        },
        {
          name: "x-publishable-api-key",
          in: "header",
          description: "Publishable API ключ",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Список новых товаров",
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
      summary: "Получить информацию о товаре",
      description: "Возвращает подробную информацию о товаре по его ID",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID товара",
          schema: {
            type: "string"
          }
        },
        {
          name: "x-publishable-api-key",
          in: "header",
          description: "Publishable API ключ",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Информация о товаре",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  product: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        description: "Уникальный идентификатор товара"
                      },
                      title: {
                        type: "string",
                        description: "Название товара"
                      },
                      description: {
                        type: "string",
                        description: "Описание товара"
                      },
                      handle: {
                        type: "string",
                        description: "URL-дружественный идентификатор товара"
                      },
                      thumbnail: {
                        type: "string",
                        description: "URL миниатюры товара"
                      },
                      images: {
                        type: "array",
                        description: "Изображения товара",
                        items: {
                          type: "object"
                        }
                      },
                      variants: {
                        type: "array",
                        description: "Варианты товара",
                        items: {
                          type: "object"
                        }
                      },
                      options: {
                        type: "array",
                        description: "Опции товара (цвет, размер и т.д.)",
                        items: {
                          type: "object"
                        }
                      },
                      categories: {
                        type: "array",
                        description: "Категории товара",
                        items: {
                          type: "object"
                        }
                      },
                      created_at: {
                        type: "string",
                        format: "date-time",
                        description: "Дата создания товара"
                      },
                      updated_at: {
                        type: "string",
                        format: "date-time",
                        description: "Дата последнего обновления товара"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: "Товар не найден"
        }
      }
    }
  },
  "/store/customers": {
    post: {
      tags: ["Customers"],
      summary: "Создать нового клиента",
      description: "Создает нового клиента на основе токена регистрации",
      parameters: [
        {
          name: "Authorization",
          in: "header",
          description: "Токен регистрации клиента",
          required: true,
          schema: {
            type: "string"
          },
          example: "Bearer {token}"
        },
        {
          name: "x-publishable-api-key",
          in: "header",
          description: "Publishable API ключ",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "customer@example.com"
                },
                first_name: {
                  type: "string",
                  example: "John"
                },
                last_name: {
                  type: "string",
                  example: "Doe"
                },
                phone: {
                  type: "string",
                  example: "+1234567890"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Клиент создан успешно",
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
  "/store/carts": {
    post: {
      tags: ["Carts"],
      summary: "Создать новую корзину",
      description: "Создает новую пустую корзину или корзину с товарами",
      parameters: [
        {
          name: "x-publishable-api-key",
          in: "header",
          description: "Publishable API ключ",
          required: true,
          schema: {
            type: "string"
          }
        }
      ],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                region_id: {
                  type: "string",
                  description: "ID региона для корзины"
                },
                items: {
                  type: "array",
                  description: "Товары для добавления в корзину",
                  items: {
                    type: "object",
                    properties: {
                      variant_id: {
                        type: "string",
                        description: "ID варианта товара"
                      },
                      quantity: {
                        type: "integer",
                        description: "Количество товара",
                        minimum: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Корзина создана успешно",
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
  "/hello-world": {
    get: {
      tags: ["Example"],
      summary: "Пример Hello World",
      description: "Простой GET запрос, возвращающий приветственное сообщение",
      responses: {
        200: {
          description: "Успешный ответ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "[GET] Hello world!"
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
      summary: "Пример Hello World с POST",
      description: "Простой POST запрос, возвращающий отправленные данные",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  example: "John Doe"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Успешный ответ",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Hello, John Doe!"
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

// Функция для генерации HTML
const generateSwaggerUIHtml = (swaggerSpec) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Medusa API Documentation" />
  <title>Medusa API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
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
    
    .download-url-wrapper {
      margin-bottom: 10px;
    }
    
    .download-url-button {
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 8px 16px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 14px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 4px;
    }
    
    .topbar {
      text-align: right;
      padding: 10px 30px;
      background: #1b1b1b;
    }
    
    .topbar a {
      color: white;
      text-decoration: none;
      margin-left: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <a href="/doc/swagger.json" target="_blank">Скачать OpenAPI спецификацию</a>
    <a href="/openapi/reviews" target="_blank">API отзывов</a>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(swaggerSpec)},
        dom_id: '#swagger-ui',
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
        docExpansion: "none"
      });
    };
  </script>
</body>
</html>
  `
}

// Обработчик GET запроса
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Если запрашивается swagger.json, возвращаем спецификацию
  if (req.url.endsWith("/swagger.json")) {
    res.setHeader("Content-Type", "application/json")
    res.json(swaggerSpec)
    return
  }

  // Генерируем HTML для Swagger UI
  const html = generateSwaggerUIHtml(swaggerSpec)
  
  // Отправляем HTML
  res.setHeader("Content-Type", "text/html")
  res.send(html)
}

// Обработчик OPTIONS запроса (для CORS)
export const OPTIONS = (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  res.status(200).send()
}

// Обрабатываем GET запрос для отображения Swagger UI
export const GET_SWAGGER_UI = (req: MedusaRequest, res: MedusaResponse) => {
  if (req.url.endsWith("/swagger.json")) {
    res.setHeader("Content-Type", "application/json")
    res.json(swaggerSpec)
    return
  }

  res.setHeader("Content-Type", "text/html")
  res.send(generateSwaggerUIHtml(swaggerSpec))
}

// Экспортируем JSON-версию спецификации для использования в инструментах
export const getSwaggerSpec = () => swaggerSpec 