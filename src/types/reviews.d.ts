export type StoreProductReview = {
  id: string;
  title: string | null;
  content: string;
  rating: number;
  created_at: string; // Дата создания
  customer_id: string | null; // ID покупателя, если он был авторизован
  first_name: string | null; // Имя из профиля или введенное при отзыве
  last_name: string | null; // Фамилия из профиля или введенная при отзыве
  // Добавьте другие поля при необходимости, например status
}; 