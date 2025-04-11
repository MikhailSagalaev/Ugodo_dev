'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ApiEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  parameters: Array<{
    name: string;
    in: string;
    description: string;
    schema: {
      type: string;
    };
  }>;
  requestBody?: {
    content: {
      'application/json': {
        schema: {
          type: string;
          properties: Record<string, { type: string }>;
        };
      };
    };
  };
  responses: {
    '200': {
      description: string;
      content: {
        'application/json': {
          schema: {
            type: string;
            description: string;
          };
        };
      };
    };
  };
}

export default function ApiDocs() {
  const [apiSpec, setApiSpec] = useState<{ paths: Record<string, Record<string, ApiEndpoint>> } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('store');

  useEffect(() => {
    fetch('/api/swagger.json')
      .then(response => response.json())
      .then(data => {
        setApiSpec(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки OpenAPI спецификации:', error);
        setLoading(false);
      });
  }, []);

  const filteredPaths = apiSpec?.paths ? 
    Object.entries(apiSpec.paths)
      .filter(([path]) => path.startsWith(`/${activeTab}`))
      .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    : [];

  return (
    <div className="container mx-auto py-10 px-5 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">API Документация</h1>
      <p className="mb-6 text-gray-600">
        Документация API для мобильных разработчиков, интегрирующихся с Medusa.
      </p>

      {/* Табы */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab('store')}
            className={`py-2 px-4 border-b-2 ${activeTab === 'store' 
              ? 'border-blue-500 text-blue-600 font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Store API
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`py-2 px-4 border-b-2 ${activeTab === 'admin' 
              ? 'border-blue-500 text-blue-600 font-medium' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Admin API
          </button>
        </div>
      </div>
      
      {loading ? (
        <p className="py-4">Загрузка спецификации API...</p>
      ) : apiSpec ? (
        <div className="space-y-8">
          {filteredPaths.length > 0 ? (
            filteredPaths.map(([path, methods]) => (
              <div key={path} className="border rounded-lg overflow-hidden bg-white">
                <div className="border-b bg-gray-50 px-4 py-3">
                  <h3 className="text-lg font-medium text-gray-900">{path}</h3>
                </div>
                <div className="divide-y">
                  {Object.entries(methods).map(([method, endpoint]) => (
                    <div key={`${path}-${method}`} className="px-4 py-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`uppercase font-mono px-2 py-1 rounded text-xs ${
                          method === 'get' ? 'bg-blue-100 text-blue-800' :
                          method === 'post' ? 'bg-green-100 text-green-800' :
                          method === 'put' ? 'bg-yellow-100 text-yellow-800' :
                          method === 'delete' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {method}
                        </span>
                        <h4 className="font-medium">{endpoint.summary}</h4>
                      </div>
                      
                      {endpoint.description && (
                        <p className="text-gray-600 mb-4">{endpoint.description}</p>
                      )}

                      {/* Параметры */}
                      {endpoint.parameters && endpoint.parameters.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Параметры</h5>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr>
                                  <th className="text-left font-medium text-gray-600 pb-2">Имя</th>
                                  <th className="text-left font-medium text-gray-600 pb-2">Расположение</th>
                                  <th className="text-left font-medium text-gray-600 pb-2">Тип</th>
                                  <th className="text-left font-medium text-gray-600 pb-2">Описание</th>
                                </tr>
                              </thead>
                              <tbody>
                                {endpoint.parameters.map((param, i) => (
                                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="py-1.5 pr-2">{param.name}</td>
                                    <td className="py-1.5 pr-2">{param.in}</td>
                                    <td className="py-1.5 pr-2">{param.schema?.type}</td>
                                    <td className="py-1.5">{param.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Request Body */}
                      {endpoint.requestBody && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Request Body</h5>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <table className="min-w-full text-sm">
                              <thead>
                                <tr>
                                  <th className="text-left font-medium text-gray-600 pb-2">Поле</th>
                                  <th className="text-left font-medium text-gray-600 pb-2">Тип</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(endpoint.requestBody.content['application/json'].schema.properties).map(([key, value], i) => (
                                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="py-1.5 pr-2">{key}</td>
                                    <td className="py-1.5">{value.type}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Response */}
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Ответ</h5>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <pre className="text-sm overflow-x-auto"><code>{endpoint.responses['200'].content['application/json'].schema.description}</code></pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>Нет доступных эндпоинтов для данного раздела.</p>
          )}
        </div>
      ) : (
        <p>Не удалось загрузить спецификацию API. Пожалуйста, попробуйте позже.</p>
      )}
      
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Дополнительные ресурсы</h2>
        <ul className="list-disc ml-5">
          <li className="mb-2">
            <a 
              href="https://res.cloudinary.com/dza7lstvk/raw/upload/v1741941475/OpenApi/product-reviews_jh8ohj.yaml" 
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Полная спецификация API отзывов продукта (YAML)
            </a>
          </li>
          <li>
            <a 
              href="https://docs.medusajs.com" 
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              Официальная документация Medusa
            </a>
          </li>
        </ul>
      </div>
      
      <div className="mt-8 pt-4 border-t">
        <Link href="/" className="text-blue-600 hover:underline">
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
} 