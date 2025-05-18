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

const NAV_ICON_SIZE = 22; // Единый размер для всех иконок

const Nav = ({ isHome = false }: { isHome?: boolean }) => {
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [showCatalogNav, setShowCatalogNav] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
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
      const currentScrollY = window.scrollY
      
      // Check if scrolled more than 100px to change header background
      if (currentScrollY > 100) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
      
      // Hide/show catalog nav based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide catalog nav
        setShowCatalogNav(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show catalog nav
        setShowCatalogNav(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() 

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [lastScrollY])

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [])

  // Determine icon color based on scroll state and group hover
  const getIconColor = () => {
    if (isScrolled) return "black";
    return "white";
  }

  const getLinkClasses = (targetPath: string) => {
      if (pathName === targetPath) {
          return "text-base font-normal transition-colors duration-200 text-black";
      }
      return "text-base font-normal transition-colors duration-200 text-black hover:text-gray-700";
  };

  return (
    <>
      {!isHome && <div style={{ height: `${headerHeight}px` }} />}
      
      <div 
        ref={headerRef}
        className={clx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200 group hover:bg-white",
          {
            "bg-transparent": !isScrolled,
            "bg-white shadow-sm": isScrolled,
          }
        )}
      >
        <header className="relative h-20 mx-auto">
          <nav className="content-container flex items-center h-full text-base">
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
                className="text-xl"
              >
                <Image
                  src="/images/logo.svg"
                  alt="Ugodo logo"
                  width={140}
                  height={40}
                  className="object-contain"
                  priority
                />
              </LocalizedClientLink>
            </div>

            <div className="flex-1 flex items-center justify-end h-full">
              <div className="hidden small:flex items-center gap-x-8 h-full">
                <div className="w-[22px] h-[22px] flex items-center justify-center">
                  <Suspense>
                    <Search isScrolled={isScrolled} />
                  </Suspense>
                </div>
                
                <LocalizedClientLink
                  href="/account/wishlist"
                  aria-label="Избранное"
                  className="w-[22px] h-[22px] flex items-center justify-center"
                >
                  <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 22 22" 
                    fill="none" 
                    stroke={!isScrolled ? "white" : "black"}
                    className="group-hover:stroke-black transition-colors duration-200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M15.3486 1.571289C16.0278 1.571905 16.7011 1.690419 17.3389 1.919922L17.6104 2.02441C18.2373 2.28569 18.8137 2.65363 19.3145 3.11035L19.5244 3.31152L19.5254 3.3125C21.7957 5.59273 21.864 9.09981 19.7402 11.4414L19.5283 11.6641L11 20.1914L2.47266 11.6641L2.25977 11.4414C0.204502 9.17497 0.202891 5.81674 2.25879 3.54004L2.47168 3.31641L2.47266 3.31543C2.95145 2.83254 3.5095 2.43645 4.12207 2.14453L4.3877 2.02637C5.10485 1.727112 5.87428 1.572073 6.65137 1.571289C8.11898 1.570947 9.5332 2.12258 10.6133 3.11621L11 3.47168L11.3877 3.11621C12.4676 2.12276 13.8813 1.571086 15.3486 1.571289Z" strokeWidth="1.14286"/>
                  </svg>
                </LocalizedClientLink>
                
                <LocalizedClientLink
                  href="/account"
                  aria-label="Аккаунт"
                  className="w-[22px] h-[22px] flex items-center justify-center"
                >
                  <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 22 22" 
                    fill="none" 
                    stroke={!isScrolled ? "white" : "black"}
                    className="group-hover:stroke-black transition-colors duration-200"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 19v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M11 9a4 4 0 100-8 4 4 0 000 8z"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </LocalizedClientLink>
                
                <div className="w-[22px] h-[22px] flex items-center justify-center">
                  <CartButton isScrolled={isScrolled} />
                </div>
              </div>
              <div className="flex small:hidden">
                <MobileMenu />
              </div>
            </div>
          </nav>
        </header>

        <div className={clx(
          "hidden small:block transition-all duration-300 transform-gpu overflow-hidden",
          {
            "bg-transparent group-hover:bg-white": !isScrolled,
            "bg-white": isScrolled,
            "max-h-14 opacity-100": showCatalogNav,
            "max-h-0 opacity-0": !showCatalogNav,
          }
        )}>
          <div className="content-container flex justify-center">
            <nav className="flex items-center h-14">
              <ul className="flex items-center gap-x-10">
                <li>
                  <LocalizedClientLink
                    href="/store"
                    className={clx(
                      "text-base font-normal transition-colors duration-200",
                      {
                        "text-white group-hover:text-black": !isScrolled,
                        "text-black": isScrolled
                      }
                    )}
                  >
                    Каталог
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/new-arrivals"
                    className={clx(
                      "text-base font-normal transition-colors duration-200",
                      {
                        "text-white group-hover:text-black": !isScrolled,
                        "text-black": isScrolled
                      }
                    )}
                  >
                    Новинки
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/bestsellers"
                    className={clx(
                      "text-base font-normal transition-colors duration-200",
                      {
                        "text-white group-hover:text-black": !isScrolled,
                        "text-black": isScrolled
                      }
                    )}
                  >
                    Хиты продаж
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/promotions"
                    className={clx(
                      "text-base font-normal transition-colors duration-200",
                      {
                        "text-white group-hover:text-black": !isScrolled,
                        "text-black": isScrolled
                      }
                    )}
                  >
                    Акции
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/brands"
                    className={clx(
                      "text-base font-normal transition-colors duration-200",
                      {
                        "text-white group-hover:text-black": !isScrolled,
                        "text-black": isScrolled
                      }
                    )}
                  >
                    Бренды
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/blog"
                    className={clx(
                      "text-base font-normal transition-colors duration-200",
                      {
                        "text-white group-hover:text-black": !isScrolled,
                        "text-black": isScrolled
                      }
                    )}
                  >
                    Блог
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/contacts"
                    className={clx(
                      "text-base font-normal transition-colors duration-200",
                      {
                        "text-white group-hover:text-black": !isScrolled,
                        "text-black": isScrolled
                      }
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
    </>
  )
}

export default Nav
