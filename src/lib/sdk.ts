import Medusa from "@medusajs/js-sdk";

// Определяем URL бэкенда Medusa
// Сначала пытаемся получить из переменных окружения, если нет - используем дефолтный
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "https://api.ugodo.ru";

// Инициализируем SDK
export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  //maxRetries: 3, // Опционально: количество попыток при ошибках сети
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});
