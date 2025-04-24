"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

// Аварийный регион используем только если все методы получения регионов из API не сработали
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
      num_code: 643,
    }
  ],
  currency_code: "RUB",
  tax_rate: 20,
  tax_code: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const listRegions = async () => {
  try {
    console.log("Запрашиваем список регионов из API...")
    
    // Сначала пробуем получить регионы без кэширования
    return sdk.client
      .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        cache: "no-store",
        next: { revalidate: 0 }
      })
      .then(({ regions }) => {
        if (regions && regions.length) {
          console.log(`Получено ${regions.length} регионов из API`);
          return regions;
        }
        
        console.log("Регионы не найдены, пробуем еще один запрос...");
        
        // Если регионов нет, пробуем еще раз с другими заголовками
        return sdk.client
          .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache"
            }
          })
          .then(({ regions }) => {
            if (regions && regions.length) {
              console.log(`Получено ${regions.length} регионов из API после повторной попытки`);
              return regions;
            }
            
            // В крайнем случае возвращаем предопределенный регион
            console.log("Регионы не найдены даже после повторной попытки, используем аварийный регион");
            return [FALLBACK_REGION];
          });
      })
      .catch((err) => {
        console.log("Ошибка при получении регионов:", err);
        return [FALLBACK_REGION];
      })
  } catch (error) {
    console.log("Исключение при получении регионов:", error);
    return [FALLBACK_REGION];
  }
}

export const retrieveRegion = async (id: string) => {
  try {
    console.log(`Запрашиваем регион с ID ${id} из API...`);
    
    // Пробуем получить регион без кэширования
    return sdk.client
      .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
        method: "GET",
        cache: "no-store",
        next: { revalidate: 0 }
      })
      .then(({ region }) => {
        console.log(`Успешно получен регион с ID ${id}`);
        return region;
      })
      .catch((err) => {
        console.log(`Ошибка при получении региона ${id}:`, err);
        
        // Пробуем еще один запрос с другими параметрами
        return sdk.client
          .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
            method: "GET",
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache"
            }
          })
          .then(({ region }) => {
            console.log(`Успешно получен регион с ID ${id} после повторной попытки`);
            return region;
          })
          .catch((innerErr) => {
            console.log(`Ошибка при повторном получении региона ${id}:`, innerErr);
            
            // В случае ошибки, пытаемся получить все регионы и найти нужный
            return listRegions().then(regions => {
              // Ищем нужный регион
              const foundRegion = regions.find(r => r.id === id);
              if (foundRegion) {
                console.log(`Найден регион ${id} через listRegions`);
                return foundRegion;
              }
              
              // Если не нашли и есть другие регионы, берем первый
              if (regions.length > 0 && regions[0].id !== FALLBACK_REGION.id) {
                console.log(`Регион ${id} не найден, используем первый доступный: ${regions[0].id}`);
                return regions[0];
              }
              
              // В самом крайнем случае используем аварийный регион
              console.log(`Не удалось найти действительный регион, используем аварийный`);
              return FALLBACK_REGION;
            });
          });
      })
  } catch (error) {
    console.log(`Критическая ошибка при получении региона ${id}:`, error);
    return FALLBACK_REGION;
  }
}

export const getRegion = async (countryCode: string) => {
  try {
    // Проверяем кэш, если в нем есть нужный код страны
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode);
    }

    // Получаем все регионы
    const regions = await listRegions();
    
    // Обновляем кэш регионов
    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region);
      });
    });

    // Находим регион по коду страны
    const region = countryCode ? regionMap.get(countryCode) : undefined;

    if (region) {
      return region;
    }

    // Если регион не найден по коду страны, возвращаем первый доступный
    if (regions.length > 0) {
      console.log(`Регион для кода страны ${countryCode} не найден, используем первый доступный`);
      return regions[0];
    }
    
    // В крайнем случае возвращаем аварийный регион
    console.log(`Нет доступных регионов, используем аварийный регион`);
    return FALLBACK_REGION;
  } catch (error) {
    console.log("Ошибка при получении региона по коду страны:", error);
    return FALLBACK_REGION;
  }
}
