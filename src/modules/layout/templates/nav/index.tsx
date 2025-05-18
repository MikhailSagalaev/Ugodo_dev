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
import { User } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"

const Nav = ({ isHome = false }: { isHome?: boolean }) => {
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchRegions = async () => {
      const fetchedRegions = await listRegions().then((regions) => regions)
      setRegions(fetchedRegions)
    }
    
    fetchRegions()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 100) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() 

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [])

  const wrapperClasses = "absolute top-0 left-0 right-0 z-50 bg-transparent group transition-all duration-200"
  const headerClasses = "relative h-16 mx-auto border-b border-transparent transition-all duration-200"
  const navClasses = "content-container txt-xsmall-plus flex items-center justify-between h-full text-small-regular text-white transition-colors duration-200"
  const secondNavClasses = "hidden small:block border-b border-transparent bg-transparent transition-all duration-200"

  const getLinkClasses = (targetPath: string) => {
      if (pathName === targetPath) {
          return clx(
              "text-sm font-medium transition-colors duration-200",
              {
                "text-white font-semibold": isHome && !isScrolled,
                "text-ui-fg-base font-semibold": !isHome || isScrolled
              }
          );
      }
      return clx(
          "text-sm font-medium transition-colors duration-200",
          {
              "text-white hover:text-gray-300": isHome && !isScrolled,
              "text-ui-fg-subtle hover:text-ui-fg-base": !isHome || isScrolled
          }
      );
  };

  return (
    <>
      {!isHome && <div style={{ height: `${headerHeight}px` }} />}
      
      <div 
        ref={headerRef}
        className={clx(
          {
            "fixed top-0 left-0 right-0 z-50 transition-all duration-200 group": isHome,
            "fixed top-0 left-0 right-0 z-50 bg-white shadow-md group": !isHome,
            "bg-transparent": isHome && !isScrolled,
            "bg-white shadow-md": isHome && isScrolled || !isHome,
          }
        )}
      >
        <header className={clx(
          "relative h-16 mx-auto border-b transition-all duration-200",
          {
            "border-transparent": isHome && !isScrolled,
            "border-ui-border-base": !isHome || isScrolled,
          }
        )}>
          <nav className={clx(
            "content-container txt-xsmall-plus flex items-center h-full text-small-regular transition-colors duration-200",
            {
              "text-white": isHome && !isScrolled,
              "text-ui-fg-subtle": !isHome || isScrolled,
            }
          )}>
          <div className="flex-1 flex items-center justify-start h-full">
            {regions && regions.length > 1 && (
              <ListRegions
                regions={regions}
                pathName={pathName}
                searchParams={searchParams}
              />
            )}
          </div>

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

          <div className="flex-1 flex items-center justify-end gap-x-4 h-full">
            <div className="hidden small:flex items-center gap-x-4 h-full">
              <Suspense>
                <Search />
              </Suspense>
              
              <LocalizedClientLink
                  className={clx("hover:text-ui-fg-base flex items-center gap-x-1", {
                    "hover:text-gray-300": isHome && !isScrolled,
                  })}
                href="/account/wishlist"
                aria-label="Избранное"
              >
                  <Image 
                    src="/images/heartIcon.svg" 
                    alt="Избранное" 
                    width={20} 
                    height={20}
                    style={{ 
                      transition: 'filter 0.2s ease-in-out',
                      filter: isHome && !isScrolled ? 'none' : 'invert(1)'
                    }}
                  />
              </LocalizedClientLink>
              
              <LocalizedClientLink
                   className={clx("hover:text-ui-fg-base flex items-center gap-x-1", {
                    "hover:text-gray-300": isHome && !isScrolled,
                  })}
                href="/account"
                aria-label="Аккаунт"
              >
                  <User className={clx({
                    "text-white": isHome && !isScrolled,
                    "text-ui-fg-subtle": !isHome || isScrolled
                  })} />
              </LocalizedClientLink>
              
              <CartButton />
            </div>
            <div className="flex small:hidden">
              <MobileMenu />
            </div>
          </div>
        </nav>
      </header>

        <div className={clx(
          "hidden small:block border-b transition-all duration-200",
          {
            "bg-transparent border-transparent": isHome && !isScrolled,
            "bg-white border-ui-border-base": !isHome || isScrolled,
          }
        )}>
        <div className="content-container flex justify-center">
          <nav className="flex items-center h-12">
            <ul className="flex items-center gap-x-8">
              <li>
                <LocalizedClientLink
                  href="/store"
                    className={getLinkClasses("/store")}
                >
                  Каталог
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/new-arrivals"
                     className={getLinkClasses("/new-arrivals")}
                >
                  Новинки
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/bestsellers"
                     className={getLinkClasses("/bestsellers")}
                >
                  Хиты продаж
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/promotions"
                     className={getLinkClasses("/promotions")}
                >
                  Акции
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/brands"
                     className={getLinkClasses("/brands")}
                >
                  Бренды
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/blog"
                     className={getLinkClasses("/blog")}
                >
                  Блог
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  href="/contacts"
                     className={getLinkClasses("/contacts")}
                >
                  Контакты
                </LocalizedClientLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
    </>
  )
}

export default Nav
