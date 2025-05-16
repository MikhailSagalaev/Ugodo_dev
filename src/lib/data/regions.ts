"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"
import { cache } from "react"

// Аварийный регион используем только если все методы получения регионов из API не сработали
// @ts-ignore - Игнорируем проблемы с типом для аварийного региона
const FALLBACK_REGION: HttpTypes.StoreRegion = {
  id: "reg_01JRHXWM9C58G2MBTFB717QEYC", // Используем реальный ID региона, если вы знаете его из админки
  name: "Россия",
  countries: [
    {
      id: "ru",
      name: "Россия",
      display_name: "Россия",
      iso_2: "ru",
      iso_3: "rus",
      num_code: "643",
    }
  ],
  currency_code: "RUB",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const listRegions = cache(async () => {
  console.log("Запрашиваем список регионов из API (упрощенная версия)...");
  try {
    // Прямой fetch запрос без обертки sdk, если sdk.client.fetch вызывает проблемы
    // const response = await fetch(`${MEDUSA_BACKEND_URL}/store/regions`, { // Требуется MEDUSA_BACKEND_URL
    //   method: "GET",
    //   cache: "no-store",
    //   headers: {
    //      "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
    //      "Content-Type": "application/json"
    //   }
    // });
    // if (!response.ok) {
    //    throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // const data = await response.json();
    // const regions = data.regions;

    // ИЛИ попробуем еще раз с sdk.client.fetch, но БЕЗ .catch()
     const { regions } = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        cache: "no-store",
     });

            if (regions && regions.length) {
      console.log(`Получено ${regions.length} регионов из API.`);
      regions.forEach((region) => {
        region.countries?.forEach((c) => {
           if(c?.iso_2) regionMap.set(c.iso_2, region);
        });
      });
              return regions;
            }
            
    console.warn("API вернуло пустой список регионов, используем аварийный регион.");
    // Проверяем наличие стран перед доступом к элементу массива
    if (FALLBACK_REGION.countries && FALLBACK_REGION.countries.length > 0 && FALLBACK_REGION.countries[0].iso_2) {
    regionMap.set(FALLBACK_REGION.countries[0].iso_2, FALLBACK_REGION);
    }
            return [FALLBACK_REGION];

  } catch (error) {
    console.error("Критическая ошибка при запросе списка регионов:", error);
    // Проверяем наличие стран перед доступом к элементу массива
    if (FALLBACK_REGION.countries && FALLBACK_REGION.countries.length > 0 && FALLBACK_REGION.countries[0].iso_2) {
    regionMap.set(FALLBACK_REGION.countries[0].iso_2, FALLBACK_REGION);
    }
    return [FALLBACK_REGION];
  }
});

export const retrieveRegion = cache(async (id: string) => {
  try {
    console.log(`Запрашиваем регион с ID ${id} из API...`);
    const { region } = await sdk.client.fetch<{ region: HttpTypes.StoreRegion }>(
      `/store/regions/${id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );
        console.log(`Успешно получен регион с ID ${id}`);
    // Кэшируем полученный регион
     region.countries?.forEach((c) => {
        if(c?.iso_2) regionMap.set(c.iso_2, region);
      });
            return region;
  } catch (error) {
     console.error(`Ошибка при запросе региона ${id}:`, error);
    // Вместо этого, просто возвращаем FALLBACK_REGION при любой ошибке получения конкретного региона
    console.warn(`Не удалось получить регион ${id}, используем аварийный`);
    return FALLBACK_REGION;
  }
});

export const getRegion = cache(async (countryCode: string) => {
  try {
    // Проверяем кэш, если в нем есть нужный код страны
    if (regionMap.has(countryCode)) {
      const cachedRegion = regionMap.get(countryCode);
      console.log(`[getRegion] Найден регион в кэше для ${countryCode}: ${cachedRegion?.name} (ID: ${cachedRegion?.id})`);
      return cachedRegion;
    }

    // Получаем все регионы
    const regions = await listRegions(); // Эта функция теперь более надежна
    
    // Обновляем кэш регионов (возможно, он уже обновлен внутри listRegions)
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        if (c?.iso_2) {
           regionMap.set(c.iso_2, region);
        }
      });
    });

    // Находим регион по коду страны
    const region = countryCode ? regionMap.get(countryCode) : undefined;

    if (region) {
      console.log(`[getRegion] Найден регион после обновления кэша для ${countryCode}: ${region.name} (ID: ${region.id})`);
      return region;
    }

    // Если регион не найден по коду страны, возвращаем первый доступный
    // Исключаем fallback регион из поиска первого доступного
    const firstAvailableRegion = regions.find(r => r.id !== FALLBACK_REGION.id);
    if (firstAvailableRegion) {
      console.log(`[getRegion] Регион для кода страны ${countryCode} не найден, используем первый доступный: ${firstAvailableRegion.name} (ID: ${firstAvailableRegion.id})`);
      return firstAvailableRegion;
    }
    
    // В крайнем случае возвращаем аварийный регион
    console.log(`[getRegion] Нет доступных регионов (кроме аварийного) для ${countryCode}, используем аварийный регион: ${FALLBACK_REGION.name} (ID: ${FALLBACK_REGION.id})`);
    return FALLBACK_REGION;
  } catch (error) {
    console.log(`[getRegion] Ошибка при получении региона для ${countryCode}:`, error, `Используем аварийный регион: ${FALLBACK_REGION.name} (ID: ${FALLBACK_REGION.id})`);
    return FALLBACK_REGION;
  }
});
