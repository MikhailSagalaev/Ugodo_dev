import { Router } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export default () => {
  const router = Router();

  // Swagger определение
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Medusa API Documentation',
      version: '1.0.0',
      description: 'API документация для Medusa Commerce',
    },
    servers: [
      {
        url: 'http://localhost:9000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
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
  };

  // Опции для swagger-jsdoc
  const options = {
    swaggerDefinition,
    // Пути к файлам, содержащим аннотации
    apis: [
      'src/modules/*/api/routes/*.ts',
      'src/modules/*/api/routes/*.js',
      'src/api/**/*.ts',
      'src/api/**/*.js',
      'medusa/src/modules/*/api/routes/*.ts',
      'medusa/src/modules/*/api/routes/*.js',
      'medusa/src/api/**/*.ts',
      'medusa/src/api/**/*.js',
    ],
  };

  // Инициализация swagger-jsdoc
  const swaggerSpec = swaggerJSDoc(options);

  // Маршрут для JSON с документацией
  router.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Настройка Swagger UI
  router.use('/', swaggerUi.serve);
  router.get('/', swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
  }));

  return router;
}; 