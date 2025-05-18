import { Router } from "express"
import swaggerUi from "swagger-ui-express"
import swaggerJSDoc from "swagger-jsdoc"

export default () => {
  const router = Router()

  // Swagger определение
  const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
      title: "Medusa API Documentation",
      version: "1.0.0",
      description: "API документация для Medusa Commerce",
    },
    servers: [
      {
        url: "http://localhost:9000",
        description: "Development server",
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
      },
    },
    security: [
      {
        bearerAuth: [],
      },
      {
        cookieAuth: [],
      },
    ],
  }

  // Опции для swagger-jsdoc
  const options = {
    swaggerDefinition,
    // Пути к файлам, содержащим аннотации
    apis: [
      "src/modules/*/api/routes/*.ts",
      "src/modules/*/models/*.ts",
      "medusa/src/modules/*/api/routes/*.ts",
      "medusa/src/modules/*/models/*.ts",
    ],
  }

  // Инициализация swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(options)

  // Настройка Swagger UI
  router.use("/", swaggerUi.serve)
  router.get("/", swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
  }))

  return router
} 