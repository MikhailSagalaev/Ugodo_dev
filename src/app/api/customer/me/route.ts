import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { MEDUSA_BACKEND_URL } from "@lib/config"; // Убедитесь, что URL бэкенда и ключ (если нужен) доступны

// Функция для проксирования запроса к Medusa /store/auth
async function getMedusaCustomer(cookieHeader: string | undefined) {
    if (!cookieHeader) {
        return null;
    }
    try {
        const response = await fetch(`${MEDUSA_BACKEND_URL}/store/auth`, {
            method: "GET",
            headers: {
                // Передаем куки от клиента
                "Cookie": cookieHeader,
                // Добавьте другие необходимые заголовки, если API Medusa их требует
                // 'x-medusa-api-key': STORE_API_KEY || '', 
            },
            cache: 'no-store', // Не кешируем статус аутентификации
        });

        if (!response.ok) {
            // Если Medusa вернула ошибку (например, 401), пользователь не авторизован
            return null;
        }

        const { customer } = await response.json();
        return customer;
    } catch (error) {
        console.error("Ошибка при запросе к Medusa /store/auth:", error);
        return null;
    }
}

export async function GET(request: Request) {
    // Получаем куки из запроса Next.js
    const cookieHeaderRaw = request.headers.get("cookie");
    // Преобразуем null в undefined
    const cookieHeader = cookieHeaderRaw === null ? undefined : cookieHeaderRaw;
    
    // Пытаемся получить пользователя из Medusa
    const customer = await getMedusaCustomer(cookieHeader);

    if (customer) {
        // Если пользователь получен, возвращаем его данные
        return NextResponse.json({ customer });
    } else {
        // Если нет, возвращаем ошибку 401
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
}

// Добавляем обработчик для CORS, если необходимо
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 