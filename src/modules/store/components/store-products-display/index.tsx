import { HttpTypes } from "@medusajs/types";
import ProductPreview from "@modules/products/components/product-preview";
import { Pagination } from "@modules/store/components/pagination";
import { Region } from "@medusajs/medusa"; // Или HttpTypes.StoreRegion

type StoreProductsDisplayProps = {
  products: HttpTypes.StoreProduct[];
  totalPages: number;
  currentPage: number;
  count: number;
  region: HttpTypes.StoreRegion;
  countryCode: string;
  searchParams?: any;
};

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
      </div>

      <ul
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 w-full justify-center"
        style={{ gap: 'clamp(30px, 4vw, 80px)' }}
        data-testid="products-list"
      >
        {products.map((p, index) => {
          const categoryTitle = p.type?.value 
                              || (p.categories && p.categories.length > 0 ? p.categories[0].name : undefined);
          return (
            <li key={p.id} className="flex justify-center">
              <div 
                className="w-full aspect-[3/4]"
                style={{ width: 'clamp(180px, calc(180px + (260 - 180) * ((100vw - 1120px) / (1920 - 1120))), 260px)' }}
              >
                <ProductPreview 
                  product={p} 
                  region={region} 
                  categoryTitle={categoryTitle}
                  textAlign="left"
                />
              </div>
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
          />
        </div>
      )}
    </div>
  );
} 