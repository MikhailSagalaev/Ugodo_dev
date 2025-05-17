import { notFound } from "next/navigation";
import { cache } from "react";

import { listProductsWithSort, type SortOptions } from "@lib/data/products";
import { getRegion } from "@lib/data/regions";
import ProductPreview from "@modules/products/components/product-preview";
import { Pagination } from "@modules/store/components/pagination";
import { HttpTypes } from "@medusajs/types";

const PRODUCT_LIMIT = 12; // Количество товаров на странице для этого компонента

interface PaginatedProductsProps {
  page: number;
  countryCode: string;
  sortBy?: SortOptions;
  collectionId?: string;
  categoryId?: string;
  // Можно добавить другие параметры фильтрации, если это нужно для главной страницы
}

// Кэширование данных для этого компонента
const fetchHomePageProducts = cache(
  async (countryCode: string, page: number, sortBy?: SortOptions, collectionId?: string, categoryId?: string) => {
    const region = await getRegion(countryCode);

    if (!region) {
      return null;
    }

    // Используем более общий тип, чтобы избежать проблем с линтером для collection_id
    const queryParams: Record<string, any> = {
      limit: PRODUCT_LIMIT,
      region_id: region.id,
    };

    if (collectionId) {
      queryParams.collection_id = [collectionId];
    }

    if (categoryId) {
      queryParams.category_id = [categoryId];
    }

    try {
      const { response } = await listProductsWithSort({
        page,
        queryParams: queryParams as HttpTypes.StoreProductParams, // Приводим к ожидаемому типу
        sortBy: sortBy || "created_at",
        countryCode,
      });
      return { ...response, region, totalPages: Math.ceil(response.count / PRODUCT_LIMIT) };
    } catch (error) {
      console.error("Ошибка при загрузке товаров для главной страницы:", error);
      return { products: [], count: 0, region, totalPages: 0 };
    }
  }
);

export default async function PaginatedProducts({
  page,
  countryCode,
  sortBy,
  collectionId,
  categoryId,
}: PaginatedProductsProps) {
  const productData = await fetchHomePageProducts(countryCode, page, sortBy, collectionId, categoryId);

  if (!productData || !productData.region) {
    return notFound(); // Или можно вернуть null/сообщение об ошибке, если notFound слишком резко
  }

  const { products, count, region, totalPages } = productData;

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Товары не найдены.</p>
      </div>
    );
  }

  return (
    <div className="content-container">
      <ul
        className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 sm:gap-x-6 sm:gap-y-10 w-full"
        data-testid="home-products-list"
      >
        {products.map((p, index) => (
          <li key={p.id}>
            <ProductPreview 
              product={p} 
              region={region} 
              isLeftSideInMobileGrid={index % 2 === 0}
              // categoryTitle не так важен для общего списка на главной, можно убрать или найти категорию по умолчанию
            />
          </li>
        ))}
      </ul>
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            page={page}
            totalPages={totalPages}
            // Для домашней страницы может не требоваться передача searchParams в Pagination,
            // так как навигация может быть проще (только по номеру страницы)
            // или нужно будет адаптировать Pagination/ссылки
          />
        </div>
      )}
    </div>
  );
} 