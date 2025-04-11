"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

// Имитация региона России для локального использования, использующая "default" как ID
const RUSSIA_REGION: HttpTypes.StoreRegion = {
  id: "default", // Используем default вместо ru
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

export const listRegions = async () => {
  try {
    // Пытаемся получить регионы из реальной системы
    const next = {
      ...(await getCacheOptions("regions")),
    }

    return sdk.client
      .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ regions }) => {
        // Если получили реальные регионы, используем их
        if (regions && regions.length) {
          return regions;
        }
        // Иначе используем наш дефолтный регион
        return [RUSSIA_REGION];
      })
      .catch(() => [RUSSIA_REGION])
  } catch (error) {
    // Даже при ошибке возвращаем дефолтный регион России
    return [RUSSIA_REGION]
  }
}

export const retrieveRegion = async (id: string) => {
  try {
    const next = {
      ...(await getCacheOptions(["regions", id].join("-"))),
    }

    return sdk.client
      .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
        method: "GET",
        next,
        cache: "force-cache",
      })
      .then(({ region }) => region)
      .catch(() => RUSSIA_REGION)
  } catch (error) {
    // Даже при ошибке возвращаем дефолтный регион России
    return RUSSIA_REGION
  }
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    // Пытаемся получить регион из системы
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (!regions) {
      return RUSSIA_REGION
    }

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        regionMap.set(c?.iso_2 ?? "", region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get("ru")

    return region || RUSSIA_REGION
  } catch (e: any) {
    return RUSSIA_REGION
  }
}
