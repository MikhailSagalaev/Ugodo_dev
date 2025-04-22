import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import path from "path"
import swaggerJsdoc from "swagger-jsdoc"

/**
 * @swagger
 * /openapi/reviews:
 *   get:
 *     summary: Получить OpenAPI спецификацию отзывов
 *     tags: [API Documentation]
 *     responses:
 *       200:
 *         description: Успешный ответ со спецификацией OpenAPI для отзывов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const rootDir = process.cwd()
  
  // Определение базового API с тегами и информацией
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Medusa Reviews API",
      version: "1.0.0",
      description: "API документация для модуля отзывов в Medusa",
    },
    servers: [
      {
        url: "http://localhost:9000",
        description: "Локальный сервер для разработки",
      },
    ],
    tags: [
      { 
        name: "Reviews", 
        description: "API для управления отзывами о товарах" 
      },
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
    },
  }

  // Опции для генерации OpenAPI спецификации
  const options = {
    swaggerDefinition,
    apis: [
      path.join(rootDir, "src/modules/review/api/routes/*.ts"),
      path.join(rootDir, "src/modules/review/models/*.ts"),
      path.join(rootDir, "src/modules/review/api/endpoints/admin/*.ts"),
    ],
  }

  // Генерация спецификации
  const swaggerSpec = swaggerJsdoc(options)
  
  // Если спецификация не содержит путей, добавляем ручное определение API отзывов
  if (!swaggerSpec.paths || Object.keys(swaggerSpec.paths).length === 0) {
    console.log("No paths found for reviews, adding manual API definitions")
    
    swaggerSpec.paths = {
      "/store/reviews": {
        get: {
          tags: ["Reviews"],
          summary: "Получение списка отзывов",
          parameters: [
            {
              in: "query",
              name: "product_id",
              schema: {
                type: "string"
              },
              description: "ID товара для фильтрации отзывов"
            },
            {
              in: "query",
              name: "status",
              schema: {
                type: "string",
                enum: ["pending", "approved", "rejected"]
              },
              description: "Статус отзывов"
            },
            {
              in: "query",
              name: "limit",
              schema: {
                type: "integer",
                default: 10
              },
              description: "Количество записей на странице"
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
              description: "Список отзывов",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      reviews: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Review"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ["Reviews"],
          summary: "Создание нового отзыва",
          security: [
            { publishableApiKey: [] },
            { bearerAuth: [] }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["product_id", "first_name", "last_name", "content", "rating"],
                  properties: {
                    title: {
                      type: "string",
                      description: "Заголовок отзыва"
                    },
                    content: {
                      type: "string",
                      description: "Текст отзыва"
                    },
                    rating: {
                      type: "number",
                      minimum: 1,
                      maximum: 5,
                      description: "Рейтинг от 1 до 5"
                    },
                    first_name: {
                      type: "string",
                      description: "Имя автора отзыва"
                    },
                    last_name: {
                      type: "string",
                      description: "Фамилия автора отзыва"
                    },
                    product_id: {
                      type: "string",
                      description: "ID товара, для которого создается отзыв"
                    },
                    customer_id: {
                      type: "string",
                      description: "ID клиента (опционально)"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "201": {
              description: "Созданный отзыв",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      review: {
                        $ref: "#/components/schemas/Review"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/store/reviews/{id}": {
        get: {
          tags: ["Reviews"],
          summary: "Получение отзыва по ID",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID отзыва"
            }
          ],
          security: [
            { publishableApiKey: [] }
          ],
          responses: {
            "200": {
              description: "Данные отзыва",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      review: {
                        $ref: "#/components/schemas/Review"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/store/products/{id}/reviews": {
        get: {
          tags: ["Reviews"],
          summary: "Получение списка отзывов для товара",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID товара"
            },
            {
              in: "query",
              name: "limit",
              schema: {
                type: "integer",
                default: 10
              },
              description: "Количество записей на странице"
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
              description: "Список отзывов товара",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      reviews: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Review"
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
      "/store/products/{id}/reviews/stats": {
        get: {
          tags: ["Reviews"],
          summary: "Получение статистики отзывов товара",
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
              description: "Статистика отзывов",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      product_id: {
                        type: "string"
                      },
                      average_rating: {
                        type: "number"
                      },
                      rating_count: {
                        type: "integer"
                      },
                      ratings_distribution: {
                        type: "object",
                        properties: {
                          "1": {
                            type: "integer"
                          },
                          "2": {
                            type: "integer"
                          },
                          "3": {
                            type: "integer"
                          },
                          "4": {
                            type: "integer"
                          },
                          "5": {
                            type: "integer"
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
      },
      "/admin/reviews": {
        get: {
          tags: ["Reviews"],
          summary: "Получение списка отзывов (административный доступ)",
          parameters: [
            {
              in: "query",
              name: "product_id",
              schema: {
                type: "string"
              },
              description: "ID товара для фильтрации отзывов"
            },
            {
              in: "query",
              name: "status",
              schema: {
                type: "string",
                enum: ["pending", "approved", "rejected"]
              },
              description: "Статус отзывов"
            },
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
              name: "limit",
              schema: {
                type: "integer",
                default: 50
              },
              description: "Количество записей на странице"
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
            { bearerAuth: [] }
          ],
          responses: {
            "200": {
              description: "Список отзывов",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      reviews: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Review"
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
      "/admin/reviews/batch": {
        post: {
          tags: ["Reviews"],
          summary: "Массовое обновление отзывов",
          description: "Обновляет статус нескольких отзывов одновременно",
          security: [
            { bearerAuth: [] }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "review_ids",
                    "action"
                  ],
                  properties: {
                    review_ids: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      description: "Массив ID отзывов"
                    },
                    action: {
                      type: "string",
                      enum: [
                        "approve",
                        "reject"
                      ],
                      description: "Действие - одобрить или отклонить отзывы"
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Успешно обновлены отзывы",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      reviews: {
                        type: "array",
                        description: "Обновленные отзывы"
                      },
                      count: {
                        type: "number",
                        description: "Количество обновленных отзывов"
                      },
                      action: {
                        type: "string",
                        description: "Выполненное действие"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/admin/reviews/{id}": {
        get: {
          tags: ["Reviews"],
          summary: "Получение отзыва по ID (административный доступ)",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID отзыва"
            }
          ],
          security: [
            { bearerAuth: [] }
          ],
          responses: {
            "200": {
              description: "Данные отзыва",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      review: {
                        $ref: "#/components/schemas/Review"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        put: {
          tags: ["Reviews"],
          summary: "Обновление отзыва (административный доступ)",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID отзыва"
            }
          ],
          security: [
            { bearerAuth: [] }
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string"
                    },
                    content: {
                      type: "string"
                    },
                    rating: {
                      type: "number",
                      minimum: 1,
                      maximum: 5
                    },
                    first_name: {
                      type: "string"
                    },
                    last_name: {
                      type: "string"
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "approved", "rejected"]
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Обновленный отзыв",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      review: {
                        $ref: "#/components/schemas/Review"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        delete: {
          tags: ["Reviews"],
          summary: "Удаление отзыва (административный доступ)",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID отзыва"
            }
          ],
          security: [
            { bearerAuth: [] }
          ],
          responses: {
            "204": {
              description: "Отзыв успешно удален"
            }
          }
        }
      },
      "/admin/reviews/{id}/approve": {
        post: {
          tags: ["Reviews"],
          summary: "Одобрение отзыва (административный доступ)",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID отзыва"
            }
          ],
          security: [
            { bearerAuth: [] }
          ],
          responses: {
            "200": {
              description: "Одобренный отзыв",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      review: {
                        $ref: "#/components/schemas/Review"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      "/admin/reviews/{id}/reject": {
        post: {
          tags: ["Reviews"],
          summary: "Отклонение отзыва (административный доступ)",
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: "string"
              },
              description: "ID отзыва"
            }
          ],
          security: [
            { bearerAuth: [] }
          ],
          responses: {
            "200": {
              description: "Отклоненный отзыв",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      review: {
                        $ref: "#/components/schemas/Review"
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

  // Определение модели Review
  if (!swaggerSpec.components) {
    swaggerSpec.components = {}
  }
  
  if (!swaggerSpec.components.schemas) {
    swaggerSpec.components.schemas = {}
  }
  
  swaggerSpec.components.schemas.Review = {
    type: "object",
    required: [
      "id",
      "content",
      "rating",
      "first_name",
      "last_name",
      "status",
      "product_id"
    ],
    properties: {
      id: {
        type: "string",
        description: "Уникальный идентификатор отзыва"
      },
      title: {
        type: "string",
        description: "Заголовок отзыва (опционально)"
      },
      content: {
        type: "string",
        description: "Текст отзыва"
      },
      rating: {
        type: "number",
        minimum: 1,
        maximum: 5,
        description: "Рейтинг товара от 1 до 5"
      },
      first_name: {
        type: "string",
        description: "Имя автора отзыва"
      },
      last_name: {
        type: "string",
        description: "Фамилия автора отзыва"
      },
      status: {
        type: "string",
        enum: ["pending", "approved", "rejected"],
        description: "Статус отзыва"
      },
      product_id: {
        type: "string",
        description: "ID товара, к которому относится отзыв"
      },
      customer_id: {
        type: "string",
        description: "ID клиента, оставившего отзыв (опционально)"
      },
      created_at: {
        type: "string",
        format: "date-time",
        description: "Дата создания отзыва"
      },
      updated_at: {
        type: "string",
        format: "date-time",
        description: "Дата последнего обновления отзыва"
      }
    }
  }

  // Возвращаем спецификацию в формате JSON
  res.setHeader("Content-Type", "application/json")
  res.json(swaggerSpec)
}

export const OPTIONS = () => {
  return new Response("", { status: 204 })
} 