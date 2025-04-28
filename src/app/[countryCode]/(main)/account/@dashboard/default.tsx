// src/app/[countryCode]/(main)/account/@dashboard/default.tsx

// Этот файл нужен для корректной работы параллельных маршрутов.
// Он будет рендериться, если для текущего URL нет явного совпадения внутри @dashboard.
// В данном случае, он не должен рендериться при переходе на /wishlist, 
// но его наличие устранит ошибку "No default component was found".
export default function DashboardDefaultPage() {
  return null; 
} 