import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "ru"

// Аварийный регион используем только если все методы получения регионов из API не сработали
const FALLBACK_REGION: HttpTypes.StoreRegion = {
  id: "reg_01JRHXWM9C58G2MBTFB717QEYC", // Используем реальный ID региона из админки
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

// Кэш регионов
const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
  defaultRegion: FALLBACK_REGION as HttpTypes.StoreRegion,
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  // Добавляем аварийный регион для России в карту регионов
  regionMapCache.regionMap.set("ru", FALLBACK_REGION);

  if (!BACKEND_URL) {
    console.log("Middleware: BACKEND_URL не определен, используем аварийный регион");
    return regionMapCache.regionMap;
  }
  
  // Если кэш устарел, обновляем его
  if (
    !regionMap.size ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      // Fetch regions from Medusa
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY || "",
        },
        cache: "no-store", // Выключаем кэширование для получения актуальных данных
      });
      
      if (!response.ok) {
        console.log(`Middleware: Ошибка при получении регионов (${response.status}), повторяем запрос`);
        
        // Пробуем еще один запрос без заголовка x-publishable-api-key
        const retryResponse = await fetch(`${BACKEND_URL}/store/regions`, {
          cache: "no-store",
        });
        
        if (!retryResponse.ok) {
          console.log(`Middleware: Повторная ошибка (${retryResponse.status}), используем аварийный регион`);
        } else {
          const { regions } = await retryResponse.json();
          
          if (!regions?.length) {
            console.log("Middleware: Нет регионов в ответе API, используем аварийный регион");
          } else {
            // Обрабатываем регионы
            regions.forEach((region: HttpTypes.StoreRegion) => {
              // Запоминаем первый регион как запасной дефолтный
              if (!regionMapCache.defaultRegion || regionMapCache.defaultRegion.id === FALLBACK_REGION.id) {
                regionMapCache.defaultRegion = region;
                console.log(`Middleware: Установлен дефолтный регион ${region.name} (${region.id})`);
              }
              
              region.countries?.forEach((c) => {
                regionMapCache.regionMap.set(c.iso_2 ?? "", region);
              });
            });
            
            console.log(`Middleware: Загружено ${regions.length} регионов, карта содержит ${regionMapCache.regionMap.size} стран`);
          }
        }
      } else {
        const { regions } = await response.json();
        
        if (!regions?.length) {
          console.log("Middleware: Нет регионов в ответе API, используем аварийный регион");
        } else {
          // Создаем карту кодов стран в регионы
          regions.forEach((region: HttpTypes.StoreRegion) => {
            // Запоминаем первый регион как запасной дефолтный
            if (!regionMapCache.defaultRegion || regionMapCache.defaultRegion.id === FALLBACK_REGION.id) {
              regionMapCache.defaultRegion = region;
              console.log(`Middleware: Установлен дефолтный регион ${region.name} (${region.id})`);
            }
            
            region.countries?.forEach((c) => {
              regionMapCache.regionMap.set(c.iso_2 ?? "", region);
            });
          });
          
          console.log(`Middleware: Загружено ${regions.length} регионов, карта содержит ${regionMapCache.regionMap.size} стран`);
        }
      }
    } catch (error) {
      console.log("Middleware: Ошибка при запросе регионов:", error);
    }

    regionMapCache.regionMapUpdated = Date.now();
  }

  return regionMapCache.regionMap;
}

/**
 * Получает код страны из запроса
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion>
) {
  try {
    // Начинаем с дефолтного региона
    let countryCode = DEFAULT_REGION;

    // Пытаемся определить страну из URL
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase();
    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode;
      return countryCode;
    }
    
    // Пытаемся определить страну из заголовка Vercel
    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase();
    if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode;
      return countryCode;
    }
    
    // По умолчанию используем DEFAULT_REGION
    return DEFAULT_REGION;
  } catch (error) {
    console.log("Middleware: Ошибка при определении страны:", error);
    return DEFAULT_REGION;
  }
}

/**
 * Middleware для обработки регионов.
 */
export async function middleware(request: NextRequest) {
  // Не обрабатываем запросы к /studio (Sanity Studio) или другим служебным путям
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/studio") || 
    pathname.startsWith("/api") || 
    pathname.startsWith("/_next") || 
    pathname.includes("favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  try {
    let cacheIdCookie = request.cookies.get("_medusa_cache_id");
    let cacheId = cacheIdCookie?.value || crypto.randomUUID();
    
    // Получаем карту регионов
    const regionMap = await getRegionMap(cacheId);
    
    // Определяем код страны
    const countryCode = await getCountryCode(request, regionMap);
    
    // Проверяем, есть ли уже код страны в URL
    const urlParts = request.nextUrl.pathname.split("/");
    const urlCountryCode = urlParts[1]?.toLowerCase();
    const urlHasCountryCode = urlCountryCode === countryCode;
    
    // Если в URL уже есть правильный код страны
    if (urlHasCountryCode) {
      // Устанавливаем cache_id если его нет
      if (!cacheIdCookie) {
        const response = NextResponse.next();
        response.cookies.set("_medusa_cache_id", cacheId, {
          maxAge: 60 * 60 * 24,
        });
        return response;
      }
      return NextResponse.next();
    }
    
    // Если в URL нет кода страны или он неправильный
    const redirectPath = pathname === "/" ? "" : pathname;
    const queryString = request.nextUrl.search || "";
    
    // Создаем URL для редиректа
    let redirectUrl = `${request.nextUrl.origin}/${countryCode}`;
    
    // Если в URL уже есть код страны, но он неправильный, заменяем его
    if (regionMap.has(urlCountryCode)) {
      urlParts[1] = countryCode;
      redirectUrl = `${request.nextUrl.origin}${urlParts.join("/")}${queryString}`;
    } else {
      redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`;
    }
    
    // Выполняем редирект и устанавливаем cache_id
    const response = NextResponse.redirect(redirectUrl, 307);
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    });
    
    return response;
  } catch (error) {
    console.log("Middleware: Критическая ошибка:", error);
    // В случае ошибки редиректим на страницу с дефолтным регионом
    const response = NextResponse.redirect(`${request.nextUrl.origin}/${DEFAULT_REGION}`, 307);
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
