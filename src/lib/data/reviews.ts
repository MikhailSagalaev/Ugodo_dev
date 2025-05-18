// src/lib/data/reviews.ts
// Удаляем импорты sdk и хелперов куки
// import { sdk } from "@lib/config"; 
// import { getAuthHeaders, getCacheOptions } from "@lib/data/cookies";
import { StoreProductReview } from "../../types/reviews"; // Используем относительный путь

// Тип ответа (должен совпадать с тем, что возвращает Medusa и наш API Route)
type PaginatedReviewsResponse = {
    reviews: StoreProductReview[];
    average_rating: number;
    count: number;
    limit: number;
    offset: number;
    // Добавляем возможное поле ошибки от нашего API Route
    error?: string; 
};

/**
 * Получает отзывы для продукта через API Route Handler.
 */
export async function getProductReviews({
    productId,
    limit = 5,
    offset = 0,
}: {
    productId: string;
    limit?: number;
    offset?: number;
}): Promise<PaginatedReviewsResponse> {
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(offset));

    // Формируем URL к нашему API Route Handler
    const url = `/api/products/${productId}/reviews?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            // Куки передаются браузером автоматически при вызове с клиента
            cache: 'no-store', // Не кешируем на стороне клиента, если API Route не кеширует
            // next: { tags: [`reviews-${productId}`] } // Теги ревалидации не работают для клиентского fetch
        });

        if (!response.ok) {
            // Пытаемся получить текст ошибки от API Route
            const errorData = await response.json().catch(() => ({ error: `HTTP error! status: ${response.status}` }))
            console.error(`Ошибка получения отзывов через API Route (${url}):`, errorData.error);
             // Возвращаем объект с ошибкой
             return { reviews: [], average_rating: 0, count: 0, limit: limit, offset: offset, error: errorData.error };
        }

        // Используем as для утверждения типа, но можно добавить проверку полей
        const data = await response.json() as PaginatedReviewsResponse;
        return data;

    } catch (error: any) {
        console.error("Ошибка fetch при получении отзывов:", error);
        return { reviews: [], average_rating: 0, count: 0, limit: limit, offset: offset, error: error.message };
    }
}

// Функция createProductReview остается Server Action (как в src/app/actions/reviews.ts)
// и не должна находиться в этом файле, так как он может импортироваться клиентом.
// Удаляем ее отсюда.
/*
 export async function createProductReview(...) {
    ...
 }
*/ 