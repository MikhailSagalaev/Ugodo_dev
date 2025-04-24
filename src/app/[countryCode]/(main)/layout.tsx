import { Metadata } from "next"
import { Suspense } from "react"

import { listCartOptions, retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { StoreCartShippingOption } from "@medusajs/types"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import { listRegions } from "@lib/data/regions"
import LocalizedProviders from "@modules/checkout/components/localized-providers"
import { revalidateTag } from "next/cache"
import { ReactNode } from "react"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: "Medusa Store",
  description: "Medusa Store",
}

export default async function MainLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { countryCode: string }
}) {
  try {
    const customer = await retrieveCustomer()
    const cart = await retrieveCart()
    let shippingOptions: StoreCartShippingOption[] = []

    if (cart) {
      const { shipping_options } = await listCartOptions()

      shippingOptions = shipping_options
    }

    // Пытаемся получить регионы
    const regions = await listRegions()
    
    // Проверяем, получены ли регионы из API или это аварийные регионы
    const isEmergencyMode = regions.length === 1 && regions[0].id.startsWith("reg_0");
    
    return (
      <>
        {isEmergencyMode && (
          <div className="p-3 text-center bg-yellow-100 text-yellow-800 text-sm">
            Система работает в аварийном режиме. Некоторые функции могут быть недоступны.
          </div>
        )}
        <Nav />
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
            {children}
          </Suspense>
        </main>
        <Footer />
      </>
    )
  } catch (error) {
    console.error("Ошибка при загрузке макета:", error);
    
    // Возвращаем базовый макет с сообщением об ошибке
    return (
      <div className="p-8">
        <div className="p-6 max-w-2xl mx-auto my-8 bg-red-50 border border-red-200 rounded-lg text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-3">Произошла ошибка при загрузке магазина</h1>
          <p className="text-red-700 mb-4">
            Мы не смогли загрузить регионы из базы данных. Пожалуйста, попробуйте обновить страницу или вернитесь позже.
          </p>
          <div className="text-sm text-red-600 p-3 bg-white rounded border border-red-100">
            Техническая информация: {(error as Error).message || "Неизвестная ошибка"}
          </div>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }
}
