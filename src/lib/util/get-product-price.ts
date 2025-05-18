import { HttpTypes } from "@medusajs/types"
import { Region } from "@medusajs/medusa"
import { convertToLocale } from "@lib/util/money"
import { getPercentageDiff } from "./get-precentage-diff" // Убедитесь, что путь правильный

// Новый, расширенный тип возвращаемого значения
type ProductPriceData = {
  calculated_price: string // Отформатированная цена со скидкой (если есть)
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

// Новая функция для получения цен, ориентированная на calculated_price
export const getProductPrice = ({
  product,
  variantId,
  region,
}: {
  product: HttpTypes.StoreProduct
  variantId?: string
  region: HttpTypes.StoreRegion | Region
}): {
  // Добавляем min/max amount
  cheapestPrice: ProductPriceData
  variantPrice: ProductPriceData
  minPriceAmount?: number
  maxPriceAmount?: number
} => {
  if (!product || !product.variants?.length || !region) {
    // Возвращаем заглушку, если данных недостаточно
    const naPrice: ProductPriceData = { calculated_price: "N/A" };
    return { cheapestPrice: naPrice, variantPrice: naPrice };
  }

  const getPriceForVariant = (variant: HttpTypes.StoreProductVariant): ProductPriceData => {
    const calculatedPriceData = variant.calculated_price;

    if (!calculatedPriceData || typeof calculatedPriceData.calculated_amount !== 'number') {
      return { calculated_price: "Not available in region" };
    }

    const localeFormat = (amount: number | null | undefined) => {
        if (amount === null || amount === undefined) return '';
        // Используем Intl.NumberFormat для правильного форматирования
        try {
            return new Intl.NumberFormat(region.metadata?.locale || 'ru-RU', { 
                style: 'currency',
                currency: region.currency_code,
                minimumFractionDigits: region.currency_code.toLowerCase() === 'rub' ? 0 : 2, 
                maximumFractionDigits: region.currency_code.toLowerCase() === 'rub' ? 0 : 2,
            }).format(amount); // УБИРАЕМ ДЕЛЕНИЕ НА 100
        } catch (error) {
            console.error("Error formatting price:", error);
            // Возврат к старому формату (тоже без деления)
            return convertToLocale({ amount: amount, currency_code: region.currency_code });
        }
    };
    
    const originalAmount = calculatedPriceData.original_amount;
    const calculatedAmount = calculatedPriceData.calculated_amount;
    const isSale = typeof originalAmount === 'number' && originalAmount > calculatedAmount;

    return {
      calculated_price: localeFormat(calculatedAmount),
      original_price: isSale ? localeFormat(originalAmount) : localeFormat(calculatedAmount), 
      calculated_amount: calculatedAmount, // Возвращаем число
      original_amount: originalAmount ?? null, // Возвращаем число или null
      price_type: isSale ? "sale" : "default",
      percentage_diff: isSale && originalAmount ? getPercentageDiff(originalAmount, calculatedAmount) : undefined,
      currency_code: region.currency_code,
    };
  };

  // --- Логика поиска самой дешевой и ДОРОГОЙ цены --- 
  let cheapestVariant: HttpTypes.StoreProductVariant | undefined = undefined;
  let minPriceAmount = Infinity;
  let maxPriceAmount = -Infinity;

  for (const variant of product.variants) {
     const priceAmount = variant.calculated_price?.calculated_amount;
     if (typeof priceAmount === 'number') {
       if (priceAmount < minPriceAmount) {
         minPriceAmount = priceAmount;
         cheapestVariant = variant;
       }
       if (priceAmount > maxPriceAmount) {
         maxPriceAmount = priceAmount;
       }
     }
  }

  // Если цены не найдены (ни одного валидного amount)
  if (minPriceAmount === Infinity) minPriceAmount = 0;
  if (maxPriceAmount === -Infinity) maxPriceAmount = 0;

  const cheapestPrice = cheapestVariant 
     ? getPriceForVariant(cheapestVariant) 
     : { calculated_price: "Not available in region" }; 

  const selectedVariant = variantId
    ? product.variants.find((v) => v.id === variantId)
    : undefined;

  const variantPrice = selectedVariant
    ? getPriceForVariant(selectedVariant)
    : { calculated_price: "Select variant" }; 

  // Возвращаем min и max
  return { cheapestPrice, variantPrice, minPriceAmount, maxPriceAmount };
};
