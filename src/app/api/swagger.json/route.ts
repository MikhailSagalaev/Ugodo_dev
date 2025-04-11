import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Загружаем локальный файл с эндпоинтами
    const filePath = path.join(process.cwd(), 'public', 'api-endpoints.json');
    const endpointsData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    // Создаем OpenAPI спецификацию на основе этих данных
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'Medusa API для мобильного приложения',
        version: '1.0.0',
        description: 'API спецификация для взаимодействия с бэкендом Medusa'
      },
      paths: {}
    };
    
    // Преобразуем наши эндпоинты в формат OpenAPI
    endpointsData.endpoints.forEach(endpoint => {
      const pathKey = endpoint.path.replace(/:([^/]+)/g, '{$1}'); // заменяем :id на {id}
      
      if (!openApiSpec.paths[pathKey]) {
        openApiSpec.paths[pathKey] = {};
      }
      
      openApiSpec.paths[pathKey][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        description: endpoint.description,
        parameters: [
          ...endpoint.params.map(param => ({
            name: param.name,
            in: 'query',
            description: param.description,
            schema: {
              type: param.type
            }
          })),
          // Добавляем путевые параметры
          ...(pathKey.includes('{') ? 
            pathKey.match(/\{([^}]+)\}/g)?.map(param => ({
              name: param.slice(1, -1), // Удаляем { }
              in: 'path',
              required: true,
              description: `ID ${param.slice(1, -1)}`,
              schema: {
                type: 'string'
              }
            })) || [] 
            : [])
        ],
        requestBody: endpoint.body ? {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: Object.entries(endpoint.body).reduce((acc, [key, type]) => {
                  acc[key] = { 
                    type: typeof type === 'string' ? type.split(' ')[0] : 'string' 
                  };
                  return acc;
                }, {})
              }
            }
          }
        } : undefined,
        responses: {
          '200': {
            description: 'Успешный ответ',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  description: endpoint.response
                }
              }
            }
          }
        }
      };
    });

    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error('Error serving OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to serve OpenAPI specification' },
      { status: 500 }
    );
  }
} 