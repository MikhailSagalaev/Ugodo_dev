'use client'

import { Fragment, Suspense, useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Popover, Transition } from '@headlessui/react'

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { Avatar, Text, clx, useToggleState } from "@medusajs/ui"
import MobileMenu from "@modules/mobile-menu/templates"
import ListRegions from "../list-regions"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import Search from "@modules/search"
import { Heart, User } from "@medusajs/icons"

const Nav = () => {
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const [regions, setRegions] = useState([])

  useEffect(() => {
    const fetchRegions = async () => {
      const fetchedRegions = await listRegions().then((regions) => regions)
      setRegions(fetchedRegions)
    }
    
    fetchRegions()
  }, [])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Первый уровень шапки */}
      <header className="relative h-16 mx-auto border-b bg-white border-ui-border-base">
        <nav className="content-container txt-xsmall-plus text-ui-fg-subtle flex items-center justify-between h-full text-small-regular">
          {/* Левая часть - выбор города */}
          <div className="flex items-center h-full">
            {regions && regions.length > 1 && (
              <ListRegions
                regions={regions}
                pathName={pathName}
                searchParams={searchParams}
              />
            )}
          </div>

          {/* Центральная часть - логотип */}
          <div className="flex items-center justify-center h-full">
            <LocalizedClientLink
              href="/"
              className="txt-compact-xlarge-plus hover:text-ui-fg-base"
            >
              <Image
                src="/images/logo.svg"
                alt="Ugodo logo"
                width={120}
                height={35}
                className="object-contain"
                priority
              />
            </LocalizedClientLink>
          </div>

          {/* Правая часть - иконки */}
          <div className="flex items-center gap-x-4 h-full">
            <div className="hidden small:flex items-center gap-x-4 h-full">
              <Suspense>
                <Search />
              </Suspense>
              
              <LocalizedClientLink
                className="hover:text-ui-fg-base flex items-center gap-x-1"
                href="/account/wishlist"
                aria-label="Избранное"
              >
                <Heart />
              </LocalizedClientLink>
              
              <LocalizedClientLink
                className="hover:text-ui-fg-base flex items-center gap-x-1"
                href="/account"
                aria-label="Аккаунт"
              >
                <User />
              </LocalizedClientLink>
              
              <CartButton />
            </div>
            <div className="flex small:hidden">
              <MobileMenu />
            </div>
          </div>
        </nav>
      </header>

      {/* Второй уровень шапки - меню разделов */}
      <div className="hidden small:block bg-white border-b border-ui-border-base">
        <div className="content-container flex justify-center">
          <nav className="flex items-center h-12">
            <ul className="flex items-center gap-x-8">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className={clx(
                    "text-sm font-medium hover:text-ui-fg-base transition-colors",
                    pathName === "/store" ? "text-ui-fg-base" : "text-ui-fg-subtle"
                  )}
                >
                  Каталог
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/new-arrivals"
                  className={clx(
                    "text-sm font-medium hover:text-ui-fg-base transition-colors",
                    pathName === "/new-arrivals" ? "text-ui-fg-base" : "text-ui-fg-subtle"
                  )}
                >
                  Новинки
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/bestsellers"
                  className={clx(
                    "text-sm font-medium hover:text-ui-fg-base transition-colors",
                    pathName === "/bestsellers" ? "text-ui-fg-base" : "text-ui-fg-subtle"
                  )}
                >
                  Хиты продаж
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/promotions"
                  className={clx(
                    "text-sm font-medium hover:text-ui-fg-base transition-colors",
                    pathName === "/promotions" ? "text-ui-fg-base" : "text-ui-fg-subtle"
                  )}
                >
                  Акции
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/brands"
                  className={clx(
                    "text-sm font-medium hover:text-ui-fg-base transition-colors",
                    pathName === "/brands" ? "text-ui-fg-base" : "text-ui-fg-subtle"
                  )}
                >
                  Бренды
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/blog"
                  className={clx(
                    "text-sm font-medium hover:text-ui-fg-base transition-colors",
                    pathName === "/blog" ? "text-ui-fg-base" : "text-ui-fg-subtle"
                  )}
                >
                  Блог
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/contacts"
                  className={clx(
                    "text-sm font-medium hover:text-ui-fg-base transition-colors",
                    pathName === "/contacts" ? "text-ui-fg-base" : "text-ui-fg-subtle"
                  )}
                >
                  Контакты
                </LocalizedClientLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Nav
