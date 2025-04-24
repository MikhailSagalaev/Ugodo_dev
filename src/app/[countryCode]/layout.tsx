import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function CountryCodeLayout(props: { children: React.ReactNode, params: { countryCode: string } }) {
  try {
    // Получаем доступные регионы
    const regions = await listRegions()
    
    // Проверяем получили ли аварийный регион
    const isEmergencyMode = regions.length === 1 && regions[0].id.startsWith("reg_0");
    if (isEmergencyMode) {
      console.log("Предупреждение: Приложение работает в аварийном режиме");
    }
    
    // Проверяем что получили хотя бы один регион
    if (!regions || regions.length === 0) {
      console.error("Не найдены регионы в системе")
      
      // Возвращаем базовый шаблон с сообщением об ошибке
      return (
        <html lang="ru" data-mode="light">
          <body>
            <div style={{ padding: "20px", textAlign: "center" }}>
              <h1>Ошибка загрузки региона</h1>
              <p>В настоящее время магазин недоступен. Пожалуйста, попробуйте позже.</p>
            </div>
          </body>
        </html>
      )
    }
    
    // Если регионы есть, продолжаем рендеринг
    return (
      <html lang="ru" data-mode="light">
        <body>
          {props.children}
        </body>
      </html>
    )
  } catch (error) {
    console.error("Ошибка при загрузке регионов:", error)
    
    // В случае ошибки возвращаем базовый шаблон с сообщением
    return (
      <html lang="ru" data-mode="light">
        <body>
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h1>Ошибка загрузки магазина</h1>
            <p>В настоящее время магазин недоступен. Пожалуйста, попробуйте позже.</p>
            <p style={{ color: "#777", fontSize: "14px", marginTop: "20px" }}>
              Техническая информация: {(error as Error).message || "Неизвестная ошибка"}
            </p>
            <button 
              style={{ 
                marginTop: "20px", 
                padding: "10px 20px", 
                backgroundColor: "#4F46E5", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer"
              }}
              onClick={() => window.location.reload()}
            >
              Обновить страницу
            </button>
          </div>
        </body>
      </html>
    )
  }
} 