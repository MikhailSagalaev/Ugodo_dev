import { HttpTypes } from "@medusajs/types"

export const getCheapestVariantPerUnit = (product: HttpTypes.StoreProduct): HttpTypes.StoreProductVariant | undefined => {
  if (!product.variants?.length) return undefined;

  let cheapestVariant: HttpTypes.StoreProductVariant | undefined = undefined;
  let minPricePerUnit = Infinity;

  const quantityOption = product.options?.find(option => 
    option.title?.toLowerCase().includes('количество')
  );

  for (const variant of product.variants) {
    const calculatedPrice = variant.calculated_price;
    if (calculatedPrice && typeof calculatedPrice.calculated_amount === 'number') {
      let quantity = 1;
      
      if (quantityOption) {
        const quantityValue = variant.options?.find(opt => opt.option_id === quantityOption.id)?.value;
        quantity = parseInt(quantityValue || '1') || 1;
      }
      
      const pricePerUnit = calculatedPrice.calculated_amount / quantity;
      
      if (pricePerUnit < minPricePerUnit) {
        minPricePerUnit = pricePerUnit;
        cheapestVariant = variant;
      }
    }
  }

  return cheapestVariant;
}; 