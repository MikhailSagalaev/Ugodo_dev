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
        <html lang="ru" suppressHydrationWarning={true}>
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
      <html lang="ru" suppressHydrationWarning={true}>
        <body>
          {props.children}
          
          {/* Глобальный обработчик для подстановки заглушки при ошибках загрузки изображений */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Глобальный обработчик ошибок для всех изображений
                document.addEventListener('DOMContentLoaded', function() {
                  // Base64 заглушка
                  const PLACEHOLDER = "data:image/png;base64,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";

                  // Заменяем все поломанные изображения на заглушку
                  document.addEventListener('error', function(e) {
                    if (e.target.tagName.toLowerCase() === 'img') {
                      console.warn('Image failed to load, using placeholder:', e.target.src);
                      e.target.src = PLACEHOLDER;
                    }
                  }, true);

                  // Дополнительно проверяем все изображения через 2 секунды
                  setTimeout(function() {
                    const images = document.querySelectorAll('img');
                    images.forEach(function(img) {
                      if (!img.complete || img.naturalWidth === 0) {
                        console.warn('Image still not loaded, using placeholder:', img.src);
                        img.src = PLACEHOLDER;
                      }
                    });
                  }, 2000);
                });
              `,
            }}
          />
        </body>
      </html>
    )
  } catch (error) {
    console.error("Ошибка при загрузке регионов:", error)
    
    // В случае ошибки возвращаем базовый шаблон с сообщением
    return (
      <html lang="ru" suppressHydrationWarning={true}>
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