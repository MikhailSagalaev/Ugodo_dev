"use server"

import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import { MEDUSA_BACKEND_URL } from "@lib/config"; // URL бэкенда Medusa

// Тип для ответа Medusa API при создании отзыва (адаптируйте, если нужно)
// Можно импортировать StoreProductReview из types, если он доступен серверу
type CreateReviewResponse = {
    review: {
        id: string;
        title: string | null;
        content: string;
        rating: number;
        customer_id: string;
        product_id: string;
        created_at: string;
        // ... другие поля
    };
}

// Экспортируем тип для использования в useFormState
export type ActionResponse = {
    success: boolean;
    message?: string | null; // Разрешаем null
    errors?: Record<string, string[]> | null; 
    review?: CreateReviewResponse['review'] | null; // Добавляем null
}

export async function createProductReviewAction(
    productId: string,
    prevState: ActionResponse | null, // Добавляем prevState
    formData: FormData
): Promise<ActionResponse> {
    let cookieHeader: string;
    
    try {
        cookieHeader = cookies().toString();
    } catch (error) {
        console.warn("Не удалось получить cookies в createProductReviewAction:", error);
        return { success: false, message: "Ошибка аутентификации (нет куки).", errors: null, review: null };
    }

    if (!cookieHeader) {
        return { success: false, message: "Ошибка аутентификации (нет куки).", errors: null, review: null };
    }

    const rating = Number(formData.get("rating"));
    const content = formData.get("content") as string;
    const title = formData.get("title") as string | null;

    // Простая валидация (можно добавить Zod)
    if (!rating || rating < 1 || rating > 5) {
        return { success: false, errors: { rating: ["Рейтинг обязателен (1-5)."] }, message: null, review: null };
    }
    if (!content) {
        return { success: false, errors: { content: ["Текст отзыва обязателен."] }, message: null, review: null };
    }

    const payload = {
        title: title || undefined, // Отправляем undefined если пустая строка/null
        content,
        rating,
        // product_id передается в URL или теле в зависимости от API Medusa
    };

    try {
        // !! ВАЖНО: Убедитесь, что эндпоинт POST /store/reviews принимает product_id В ТЕЛЕ
        // Если он ожидает его в URL (/store/products/:id/reviews), адаптируйте URL и payload
        const response = await fetch(`${MEDUSA_BACKEND_URL}/store/reviews`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": cookieHeader,
            },
            body: JSON.stringify({ ...payload, product_id: productId }),
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Пытаемся получить тело ошибки
            console.error("Medusa API Error (/store/reviews):", response.status, errorData);
            return { 
                success: false, 
                message: `Ошибка API: ${errorData.message || response.statusText || 'Неизвестная ошибка'} (Статус: ${response.status})`, 
                errors: null, 
                review: null 
            };
        }

        const { review } = await response.json() as CreateReviewResponse;

        // Ревалидация кеша для списка отзывов этого продукта
        revalidateTag(`reviews-${productId}`);
        // Можно ревалидировать и тег 'auth', если создание отзыва влияет на данные пользователя
        // revalidateTag('auth');

        return { success: true, message: "Отзыв успешно создан!", review: review || null, errors: null };

    } catch (error: any) {
        console.error("Ошибка Server Action (createProductReviewAction):", error);
        return { success: false, message: `Внутренняя ошибка сервера: ${error.message}`, errors: null, review: null };
    }
} 