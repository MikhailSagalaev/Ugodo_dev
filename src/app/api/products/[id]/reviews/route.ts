import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { MEDUSA_BACKEND_URL } from "@lib/config"; // URL бэкенда Medusa

// Получаем ключ API из переменных окружения
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

// Функция для проксирования запроса к Medusa /store/products/:id/reviews
async function getMedusaReviews(productId: string, limit: string | null, offset: string | null, cookieHeader: string | undefined) {
    const params = new URLSearchParams();
    if (limit) params.set("limit", limit);
    if (offset) params.set("offset", offset);
    params.set("order", "-created_at"); // Добавляем сортировку по умолчанию

    const url = `${MEDUSA_BACKEND_URL}/store/products/${productId}/reviews?${params.toString()}`;

    // Убедимся, что ключ API доступен
    if (!PUBLISHABLE_API_KEY) {
      console.error("Ошибка: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY не установлен в переменных окружения.");
      return NextResponse.json({ error: "Internal Server Configuration Error: Missing API key" }, { status: 500 });
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                // Передаем куки, если они есть
                ...(cookieHeader ? { "Cookie": cookieHeader } : {}),
                // ОБЯЗАТЕЛЬНО передаем Publishable API Key
                "x-publishable-api-key": PUBLISHABLE_API_KEY,
                // Добавляем стандартные заголовки на всякий случай
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            cache: 'no-store', // Отзывы обычно не стоит жестко кешировать
        });

        if (!response.ok) {
             // Попытка прочитать тело ошибки от Medusa
            const errorBody = await response.json().catch(() => ({ message: response.statusText }));
            console.error(`Ошибка при запросе к Medusa ${url}:`, response.status, errorBody);
            // Передаем статус и сообщение ошибки клиенту
            // Не возвращаем 500, если Medusa вернула конкретную ошибку (например, 400)
            return NextResponse.json({ error: `Medusa API Error: ${errorBody.message || response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        // Возвращаем успешный ответ как есть от Medusa
        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`Ошибка при запросе к ${url}:`, error);
        return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
    }
}

export async function GET(
  request: NextRequest,
  // Контекст с параметрами маршрута
  context: { params: { id: string } }
) {
    // Получаем ID продукта из context.params
    const productId = context.params.id;
    // Получаем query параметры limit и offset из URL запроса
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Асинхронно получаем куки, если они нужны
    let cookieHeader: string | undefined = undefined;
    try {
      const cookieStore = await cookies(); // Используем await
      const allCookies = cookieStore.getAll();
      if (allCookies.length > 0) {
           cookieHeader = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
      }
    } catch (error) {
       // Ошибка может возникнуть, если cookies() вызывается вне контекста запроса,
       // но в API Route это не должно происходить. Логируем на всякий случай.
       console.warn("Не удалось получить cookies в API route /api/products/[id]/reviews:", error);
    }

    // Вызываем функцию для получения отзывов от Medusa
    // Передаем productId, limit, offset и cookieHeader
    return await getMedusaReviews(productId, limit, offset, cookieHeader);
}

// Добавляем обработчик для CORS, если необходимо
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 