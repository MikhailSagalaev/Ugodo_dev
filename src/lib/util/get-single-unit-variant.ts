import { HttpTypes } from "@medusajs/types"

export const getSingleUnitVariant = (product: HttpTypes.StoreProduct): HttpTypes.StoreProductVariant | undefined => {
  if (!product.variants?.length) return undefined;

  const quantityOption = product.options?.find(option => 
    option.title?.toLowerCase().includes('количество')
  );

  if (!quantityOption) {
    // Если нет опции количества, возвращаем первый вариант
    return product.variants[0];
  }

  // Ищем вариант с количеством 1
  const singleUnitVariant = product.variants.find(variant => {
    const quantityValue = variant.options?.find(opt => opt.option_id === quantityOption.id)?.value;
    const quantity = parseInt(quantityValue || '1') || 1;
    return quantity === 1;
  });

  // Если не нашли вариант с количеством 1, возвращаем первый
  return singleUnitVariant || product.variants[0];
}; 