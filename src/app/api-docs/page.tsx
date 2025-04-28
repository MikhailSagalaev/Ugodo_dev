'use client'; // Swagger UI работает только на клиенте

import 'swagger-ui-react/swagger-ui.css'; // Импортируем стили
import dynamic from 'next/dynamic'; // Используем dynamic import

// Динамически импортируем SwaggerUI, чтобы он не загружался на сервере
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  // URL к вашей OpenAPI спецификации
  const specUrl = '/api/swagger.json'; // Убедитесь, что этот URL правильный

  return (
    <div className="container mx-auto py-10 px-5">
      <h1 className="text-3xl font-bold mb-6">Интерактивная API Документация</h1>
      {/* Рендерим Swagger UI */}
      <SwaggerUI url={specUrl} />
    </div>
  );
} 