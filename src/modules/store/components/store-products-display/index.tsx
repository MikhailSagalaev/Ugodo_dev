import { HttpTypes } from "@medusajs/types";
import ProductPreview from "@modules/products/components/product-preview";
import { Pagination } from "@modules/store/components/pagination";
import { Region } from "@medusajs/medusa"; // Или HttpTypes.StoreRegion

interface StoreProductsDisplayProps {
  products: HttpTypes.StoreProduct[];
  totalPages: number;
  currentPage: number;
  count: number;
  region: HttpTypes.StoreRegion; // Используем тип из HttpTypes для консистентности
  countryCode: string;
  searchParams?: Record<string, string | string[] | undefined>; // Для построения ссылок пагинации
}

export default async function StoreProductsDisplay({
  products,
  totalPages,
  currentPage,
  count,
  region,
  countryCode,
  searchParams
}: StoreProductsDisplayProps) {
  if (!products || products.length === 0) {
    return (
      <div className="w-full py-10 flex flex-col items-center">
        <p className="text-xl font-medium text-gray-700 mb-2">Товары не найдены</p>
        <p className="text-sm text-gray-500">Попробуйте изменить фильтры или проверить категорию.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Показано {products.length} из {count} товаров
        </p>
        {/* Здесь можно добавить селектор для количества товаров на странице, если нужно */}
      </div>

      <ul
        className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-x-6 sm:gap-y-10 w-full"
        data-testid="products-list"
      >
        {products.map((p, index) => {
          const categoryTitle = p.type?.value 
                              || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
          // Логика для isLeftSideInMobileGrid может понадобиться, если есть специфичные стили
          // const isLeftSideInMobileGrid = index % 2 === 0; 
          return (
            <li key={p.id} className="">
              <ProductPreview 
                product={p} 
                region={region} 
                categoryTitle={categoryTitle} 
                // isLeftSideInMobileGrid={isLeftSideInMobileGrid}
              />
            </li>
          );
        })}
      </ul>

      {totalPages > 1 && (
        <div className="mt-12">
          <Pagination
            data-testid="product-pagination"
            page={currentPage}
            totalPages={totalPages}
            // searchParams для генерации ссылок пагинации, если компонент Pagination это поддерживает
            // Иначе, StorePage должен будет передавать их в нужном формате
          />
        </div>
      )}
    </div>
  );
} 