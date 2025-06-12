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
  params: Promise<{ countryCode: string }>
}) {
  try {
    const { countryCode } = await params
    const customer = await retrieveCustomer()
    const cart = await retrieveCart()
    let shippingOptions: StoreCartShippingOption[] = []

    if (cart) {
      const { shipping_options } = await listCartOptions()

      shippingOptions = shipping_options
    }

    // Пытаемся получить регионы
    const regions = await listRegions()
    
    return (
      <div className="min-h-screen flex flex-col">
        <Suspense>
          <NavWithHome countryCode={countryCode} />
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
        <main className="relative flex-1">
          <Suspense fallback={<div className="p-8 text-center">Загрузка контента...</div>}>
            {/* <LocalizedProviders> */} {/* Закомментировано временно */}
            {children}
          </Suspense>
        </main>
        <Footer />
      </div>
    )
  } catch (error) {
    console.error("Ошибка при загрузке макета:", error);
    
    // Возвращаем базовый макет с сообщением об ошибке
    return (
      <div className="min-h-screen flex flex-col">
        <div className="p-8 text-center text-red-500">
          Произошла ошибка при загрузке страницы. Попробуйте обновить страницу.
        </div>
        <Footer />
      </div>
    )
  }
}
