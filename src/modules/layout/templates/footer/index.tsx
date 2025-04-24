import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { Text, clx } from "@medusajs/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

  return (
    <footer className="border-t border-neutral-200 w-full bg-neutral-50">
      <div className="content-container flex flex-col w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-16">
          <div className="flex flex-col gap-4">
            <LocalizedClientLink
              href="/"
              className="text-xl font-semibold text-violet-600"
            >
              UGODO
            </LocalizedClientLink>
            <p className="text-sm text-neutral-600 max-w-xs">
              Стильные и качественные товары для вашего дома. Создавайте уют и комфорт вместе с нами.
            </p>
            <div className="flex gap-4 mt-4">
              <a 
                href="#" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-neutral-200 hover:bg-violet-50 hover:border-violet-200 transition-colors"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-violet-600">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-neutral-200 hover:bg-violet-50 hover:border-violet-200 transition-colors"
                aria-label="Facebook"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-violet-600">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-neutral-200 hover:bg-violet-50 hover:border-violet-200 transition-colors"
                aria-label="Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-violet-600">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            </div>
          </div>

          {productCategories && productCategories?.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="font-medium text-violet-600">
                Категории
              </span>
              <ul className="grid grid-cols-1 gap-2">
                {productCategories?.slice(0, 6).map((c) => {
                  if (c.parent_category) {
                    return null
                  }

                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="text-neutral-600 hover:text-violet-600 transition-colors text-sm"
                        href={`/categories/${c.handle}`}
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {collections && collections.length > 0 && (
            <div className="flex flex-col gap-4">
              <span className="font-medium text-violet-600">
                Коллекции
              </span>
              <ul className="grid grid-cols-1 gap-2">
                {collections?.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      className="text-neutral-600 hover:text-violet-600 transition-colors text-sm"
                      href={`/collections/${c.handle}`}
                    >
                      {c.title}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <span className="font-medium text-violet-600">Информация</span>
            <ul className="grid grid-cols-1 gap-2">
              <li>
                <LocalizedClientLink
                  href="/about"
                  className="text-neutral-600 hover:text-violet-600 transition-colors text-sm"
                >
                  О нас
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/contact"
                  className="text-neutral-600 hover:text-violet-600 transition-colors text-sm"
                >
                  Контакты
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/delivery"
                  className="text-neutral-600 hover:text-violet-600 transition-colors text-sm"
                >
                  Доставка
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/returns"
                  className="text-neutral-600 hover:text-violet-600 transition-colors text-sm"
                >
                  Возврат
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full py-6 border-t border-neutral-200 items-center justify-between gap-4 text-neutral-500">
          <Text className="text-xs">
            © {new Date().getFullYear()} Ugodo. Все права защищены.
          </Text>
          <div className="flex gap-4 text-xs">
            <LocalizedClientLink href="/privacy" className="hover:text-violet-600 transition-colors">
              Политика конфиденциальности
            </LocalizedClientLink>
            <LocalizedClientLink href="/terms" className="hover:text-violet-600 transition-colors">
              Условия использования
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
