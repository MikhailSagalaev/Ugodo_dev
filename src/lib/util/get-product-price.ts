/**
 * @file: get-product-price.ts
 * @description: Утилита для получения и форматирования цен на продукты.
 * @dependencies: @medusajs/types, @medusajs/medusa, ./money, ./get-precentage-diff
 * @created: [Дата создания файла, если известна, иначе дата изменения]
 */
import { HttpTypes } from "@medusajs/types"
import { Region } from "@medusajs/medusa"
import { convertToLocale } from "@lib/util/money"
import { getPercentageDiff } from "./get-precentage-diff"

// Тип возвращаемого значения
type ProductPriceData = {
  calculated_price: string // Отформатированная цена
  original_price: string // Отформатированная оригинальная цена (если есть скидка)
  calculated_amount: number // Числовое значение цены
  original_amount: number | null // Числовое значение оригинальной цены
  price_type?: "sale" | "default" // Тип цены
  percentage_diff?: number // Процент скидки числом
  currency_code: string // Код валюты
} | {
  calculated_price: string // Заглушка, если цена недоступна
  original_price?: undefined
  calculated_amount?: undefined
  original_amount?: undefined
  price_type?: undefined
  percentage_diff?: undefined
  currency_code?: undefined
}

// Функция для получения цен, ориентированная на calculated_price
export const getProductPrice = ({
  product,
  variantId,
  region,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
  region: HttpTypes.StoreRegion | Region
}): {
  cheapestPrice: ProductPriceData
  variantPrice: ProductPriceData
  minPriceAmount?: number
  maxPriceAmount?: number
} => {
  if (!product || !product.variants?.length || !region) {
    const naPrice: ProductPriceData = { calculated_price: "N/A" };
    return { cheapestPrice: naPrice, variantPrice: naPrice };
  }

  const getPriceForVariant = (variant: HttpTypes.StoreProductVariant): ProductPriceData => {
    const calculatedPriceData = variant.calculated_price;

    if (calculatedPriceData && typeof calculatedPriceData.calculated_amount === 'number') {
      const priceToUse = calculatedPriceData.calculated_amount;
      const originalPriceToUse = calculatedPriceData.original_amount;
      const priceType = typeof originalPriceToUse === 'number' && originalPriceToUse > priceToUse ? "sale" : "default";

      const localeFormat = (amount: number | null | undefined) => {
          if (amount === null || amount === undefined) return '';
          try {
              return new Intl.NumberFormat(region.metadata?.locale || 'ru-RU', { 
                  style: 'currency',
                  currency: region.currency_code,
                  minimumFractionDigits: region.currency_code.toLowerCase() === 'rub' ? 0 : 2, 
                  maximumFractionDigits: region.currency_code.toLowerCase() === 'rub' ? 0 : 2,
              }).format(amount);
          } catch (error) {
              console.error("Error formatting price:", error);
              return convertToLocale({ amount: amount, currency_code: region.currency_code });
          }
      };
      
      const finalOriginalAmount = originalPriceToUse ?? priceToUse;
      const isSaleType = priceType === "sale";

      let percentageDiffValue: number | undefined = undefined;
      if (isSaleType && typeof originalPriceToUse === 'number' && typeof priceToUse === 'number') {
        const diff = getPercentageDiff(originalPriceToUse, priceToUse);
        percentageDiffValue = typeof diff === 'number' ? diff : undefined;
      }

      return {
        calculated_price: localeFormat(priceToUse),
        original_price: localeFormat(finalOriginalAmount), 
        calculated_amount: priceToUse, 
        original_amount: finalOriginalAmount as number | null, 
        price_type: priceType,
        percentage_diff: percentageDiffValue,
        currency_code: region.currency_code || 'RUB',
      };
    }
    // Если calculated_price невалиден или отсутствует
    return { calculated_price: "Not available in region" };
  };

  let cheapestVariant: HttpTypes.StoreProductVariant | undefined = undefined;
  let minPriceAmount = Infinity;
  let maxPriceAmount = -Infinity;

  for (const variant of product.variants) {
     const priceData = getPriceForVariant(variant); 
     if (typeof priceData.calculated_amount === 'number') {
       if (priceData.calculated_amount < minPriceAmount) {
         minPriceAmount = priceData.calculated_amount;
         cheapestVariant = variant;
       }
       if (priceData.calculated_amount > maxPriceAmount) {
         maxPriceAmount = priceData.calculated_amount;
       }
     }
  }

  if (minPriceAmount === Infinity) minPriceAmount = 0;
  if (maxPriceAmount === -Infinity) maxPriceAmount = 0;

  const cheapestPrice = cheapestVariant 
     ? getPriceForVariant(cheapestVariant) 
     : { calculated_price: "Not available in region" }; 

  const selectedVariant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : cheapestVariant;

  const variantPrice = selectedVariant
    ? getPriceForVariant(selectedVariant)
    : { calculated_price: "Select variant" }; 

  return { cheapestPrice, variantPrice, minPriceAmount, maxPriceAmount };
};
