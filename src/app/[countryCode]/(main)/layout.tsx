import { Metadata } from "next"
import { Suspense } from "react"
// Удаляем эту строку, так как usePathname только для клиентских компонентов
// import { usePathname } from "next/navigation"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import { listRegions } from "@lib/data/regions"
// Импортируем NavWithHome из нового файла, который мы создадим
import NavWithHome from "@modules/layout/components/nav-with-home"
import { revalidateTag } from "next/cache"
import { ReactNode } from "react"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Medusa Store",
  description: "Medusa Store",
}

// Удаляем клиентский компонент NavWithHome отсюда, он будет в отдельном файле
// function NavWithHome({ countryCode }: { countryCode: string }) {
//   const pathname = usePathname()
//   // Главная: /[countryCode] или /[countryCode]/
//   const isHome = pathname === `/${countryCode}` || pathname === `/${countryCode}/`
//   return <Nav isHome={isHome} />
// }

export default async function MainLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { countryCode: string }
}) {
  let customer = null;
  let cart = null;
  let shippingOptions: StoreCartShippingOption[] = [];
  let regions = [];
  let isEmergencyMode = false;
  let loadingError = null;

  try {
    // Получаем данные клиента с обработкой возможных ошибок
    customer = await retrieveCustomer().catch(error => {
      console.error("Ошибка при получении данных клиента:", error instanceof Error ? error.message : String(error));
      return null;
    });

    // Получаем корзину
    cart = await retrieveCart().catch(error => {
      console.error("Ошибка при получении корзины:", error instanceof Error ? error.message : String(error));
      return null;
    });

    // Если корзина получена успешно, получаем варианты доставки
    if (cart) {
      try {
        const { shipping_options } = await listCartOptions();
        shippingOptions = shipping_options;
      } catch (error) {
        console.error("Ошибка при получении вариантов доставки:", error instanceof Error ? error.message : String(error));
      }
    }

    // Пытаемся получить регионы
    try {
      regions = await listRegions();
    // Проверяем, получены ли регионы из API или это аварийные регионы
      isEmergencyMode = regions.length === 1 && regions[0].id.startsWith("reg_0");
    } catch (error) {
      console.error("Ошибка при получении регионов:", error instanceof Error ? error.message : String(error));
      isEmergencyMode = true;
    }
  } catch (error) {
    console.error("Критическая ошибка при загрузке макета:", error);
    loadingError = error;
  }

  // Если произошла критическая ошибка, возвращаем страницу с сообщением об ошибке
  if (loadingError) {
    return (
      <div className="p-8">
        <div className="p-6 max-w-2xl mx-auto my-8 bg-red-50 border border-red-200 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-3">Произошла ошибка при загрузке магазина</h1>
          <p className="text-red-700 mb-4">
            Мы не смогли загрузить необходимые данные. Пожалуйста, попробуйте обновить страницу или вернитесь позже.
          </p>
          <div className="text-sm text-red-600 p-3 bg-white rounded border border-red-100">
            Техническая информация: {loadingError instanceof Error ? loadingError.message : String(loadingError)}
          </div>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  // Нормальный рендер макета
    return (
      <>
        {isEmergencyMode && (
          <div className="p-3 text-center bg-yellow-100 text-yellow-800 text-sm">
            Система работает в аварийном режиме. Некоторые функции могут быть недоступны.
          </div>
        )}
        <Suspense>
          <NavWithHome countryCode={params.countryCode} />
        </Suspense>
        {customer && cart && (
          <CartMismatchBanner customer={customer} cart={cart} />
        )}

        {cart && (
          <FreeShippingPriceNudge
            variant="popup"
            cart={cart}
            shippingOptions={shippingOptions}
          />
        )}
        <main className="relative">
          <Suspense fallback={<div className="p-8 text-center">Загрузка контента...</div>}>
            {/* <LocalizedProviders> */} {/* Закомментировано временно */}
            {children}
          </Suspense>
        </main>
        <Footer />
      </>
  );
}
