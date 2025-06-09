"use client"

import { Suspense, useEffect, useRef, useState, useCallback } from "react"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import clx from "clsx"

import { listRegions } from "@lib/data/regions"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import Search from "@modules/search"
import MobileMenu from "@modules/mobile-menu/templates"
import ListRegions from "@modules/layout/templates/list-regions"
import CatalogDropdown from "@modules/layout/components/catalog-dropdown"

const Nav = ({ isHome = false, isTransparent }: { isHome?: boolean; isTransparent?: boolean }) => {
  const pathName = usePathname()
  const searchParams = useSearchParams()
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])
  const [isScrolled, setIsScrolled] = useState(false)
  const [headerHeight, setHeaderHeight] = useState(0)
  const [showCatalogNav, setShowCatalogNav] = useState(true)
  const [showMobileBanner, setShowMobileBanner] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const headerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showCatalogDropdown, setShowCatalogDropdown] = useState(false)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isStorePage = pathName.includes('/store') || pathName.includes('/categories')
  const isProductPage = pathName.includes('/products/')
  // Если isTransparent не передан, используем isHome для обратной совместимости
  const shouldBeTransparent = isTransparent !== undefined ? isTransparent : isHome

  const handleCatalogMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setShowCatalogDropdown(true)
  }, [])

  const handleCatalogMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setShowCatalogDropdown(false)
    }, 500)
  }, [])

  const handleDropdownMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const handleDropdownMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setShowCatalogDropdown(false)
    }, 500)
  }, [])

  useEffect(() => {
    setIsClient(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchRegions = async () => {
      const fetchedRegions = await listRegions().then((regions) => regions)
      setRegions(fetchedRegions)
    }
    
    fetchRegions()
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      setLastScrollY(prevLastScrollY => {
        if (shouldBeTransparent) {
          if (currentScrollY > 100) {
            setIsScrolled(true)
          } else {
            setIsScrolled(false)
          }
        } else {
          setIsScrolled(true)
        }
        
        if (!isStorePage) {
          if (currentScrollY > prevLastScrollY && currentScrollY > 100) {
            setShowCatalogNav(false)
            if (isMobile) {
              setShowMobileBanner(false)
            }
          } else if (currentScrollY < prevLastScrollY) {
            setShowCatalogNav(true)
          }
        } else {
          setShowCatalogNav(true)
        }
        
        if (isMobile) {
          if (currentScrollY === 0) {
            setShowMobileBanner(true)
          } else {
            setShowMobileBanner(false)
          }
        }
        
        return currentScrollY
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() 

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [isMobile, isClient, isStorePage, shouldBeTransparent])

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight)
    }
  }, [isClient])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  // Предотвращаем гидратацию - показываем правильную версию сразу
  if (!isClient) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div style={{ height: "180px" }} />
        </div>
      </>
    )
  }

  if (isMobile) {
    return (
      <>
        <div 
          ref={headerRef}
          className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm"
        >
          <header className="relative h-16 mx-auto">
            <nav className="px-4 flex items-center justify-between h-full">
              <div className="w-[25px] h-[25px] flex items-center justify-center">
                <MobileMenu />
              </div>

              <div className="w-[25px] h-[25px] flex items-center justify-center">
                <Suspense>
                  <Search isScrolled={true} />
                </Suspense>
              </div>

              <div className="w-[25px] h-[25px] flex items-center justify-center">
                <LocalizedClientLink href="/">
                  <div className="w-[25px] h-[25px] relative">
                    <Image
                      src="/images/logo/logo2.png"
                      alt="Ugodo logo"
                      fill
                      className="object-fill"
                      priority
                    />
                  </div>
                </LocalizedClientLink>
              </div>

              <div className="w-[25px] h-[25px] flex items-center justify-center">
                <LocalizedClientLink
                  href="/account/wishlist"
                  aria-label="Избранное"
                  className="w-[25px] h-[25px] flex items-center justify-center"
                >
                  <svg 
                    width="25" 
                    height="25" 
                    viewBox="0 0 22 22" 
                    fill="none" 
                    stroke="black"
                    className="transition-colors duration-200 hover:stroke-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M15.3486 1.571289C16.0278 1.571905 16.7011 1.690419 17.3389 1.919922L17.6104 2.02441C18.2373 2.28569 18.8137 2.65363 19.3145 3.11035L19.5244 3.31152L19.5254 3.3125C21.7957 5.59273 21.864 9.09981 19.7402 11.4414L19.5283 11.6641L11 20.1914L2.47266 11.6641L2.25977 11.4414C0.204502 9.17497 0.202891 5.81674 2.25879 3.54004L2.47168 3.31641L2.47266 3.31543C2.95145 2.83254 3.5095 2.43645 4.12207 2.14453L4.3877 2.02637C5.10485 1.727112 5.87428 1.572073 6.65137 1.571289C8.11898 1.570947 9.5332 2.12258 10.6133 3.11621L11 3.47168L11.3877 3.11621C12.4676 2.12276 13.8813 1.571086 15.3486 1.571289Z" strokeWidth="1.14286"/>
                  </svg>
                </LocalizedClientLink>
              </div>
                
              <div className="w-[25px] h-[25px] flex items-center justify-center">
                <CartButton isScrolled={true} />
              </div>
            </nav>
          </header>
          
          {!isHome && isProductPage && (
            <div className="bg-[#BAFF29] h-[40px] flex items-center justify-center">
              <div className="overflow-hidden whitespace-nowrap w-full">
                <div className="animate-marquee inline-block">
                  <span 
                    className="text-black"
                    style={{ 
                      fontSize: "11px",
                      fontWeight: 500
                    }}
                  >
                    дополнительная скидка -25% по промокоду ВМЕСТЕ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ height: (!isHome && isProductPage) ? "104px" : "64px" }} className="transition-all duration-300" />
      </>
    )
  }

  return (
    <>
      {!shouldBeTransparent && <div style={{ height: "180px" }} />}
      
      <div 
        ref={headerRef}
        className={clx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200 group",
          {
            "bg-transparent hover:bg-white": shouldBeTransparent && !isScrolled,
            "bg-white shadow-sm": isScrolled || !shouldBeTransparent,
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
                  src="/images/logo/logo.png"
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
                    <Search isScrolled={isScrolled || !shouldBeTransparent} />
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
                    stroke={!shouldBeTransparent || isScrolled ? "black" : "white"}
                    className={clx("transition-colors duration-200 group-hover:stroke-black hover:stroke-gray-400")}
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
                    stroke={!shouldBeTransparent || isScrolled ? "black" : "white"}
                    className={clx("transition-colors duration-200 group-hover:stroke-black hover:stroke-gray-400")}
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
                
                <div className="w-[22px] h-[22px] flex items-center justify-center relative z-[60]">
                  <CartButton isScrolled={isScrolled || !shouldBeTransparent} />
                </div>
              </div>
              <div className="flex small:hidden">
                <MobileMenu />
              </div>
            </div>
          </nav>
        </header>

        <div 
          className={clx(
            "hidden small:block transition-all duration-300 transform-gpu overflow-hidden z-50 relative",
            {
              "bg-transparent group-hover:bg-white": shouldBeTransparent && !isScrolled,
              "bg-white": isScrolled || !shouldBeTransparent,
              "max-h-14 opacity-100": showCatalogNav,
              "max-h-0 opacity-0": !showCatalogNav,
            }
          )}
        >
          <div className="content-container flex justify-center">
            <nav className="flex items-center h-14">
              <ul className="flex items-center gap-x-16">
                <li 
                  className="relative"
                  onMouseEnter={handleCatalogMouseEnter}
                  onMouseLeave={handleCatalogMouseLeave}
                >
                  <LocalizedClientLink
                    href="/store"
                    className={clx(
                      "text-[16px] font-normal transition-colors duration-200 relative hover:after:w-full after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200",
                      {
                        "text-white group-hover:text-black hover:text-gray-400 group-hover:hover:text-gray-400 after:bg-gray-400 group-hover:after:bg-gray-400": shouldBeTransparent && !isScrolled,
                        "text-black hover:text-gray-400 after:bg-gray-400": isScrolled || !shouldBeTransparent
                      }
                    )}
                  >
                    каталог
                  </LocalizedClientLink>
                </li>
                
                <li>
                  <LocalizedClientLink
                    href="/new-arrivals"
                    className={clx(
                      "text-[16px] font-normal transition-colors duration-200 relative hover:after:w-full after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200",
                      {
                        "text-white group-hover:text-black hover:text-gray-400 group-hover:hover:text-gray-400 after:bg-gray-400 group-hover:after:bg-gray-400": shouldBeTransparent && !isScrolled,
                        "text-black hover:text-gray-400 after:bg-gray-400": isScrolled || !shouldBeTransparent
                      }
                    )}
                  >
                    новинки
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/bestsellers"
                    className={clx(
                      "text-[16px] font-normal transition-colors duration-200 relative hover:after:w-full after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200",
                      {
                        "text-white group-hover:text-black hover:text-gray-400 group-hover:hover:text-gray-400 after:bg-gray-400 group-hover:after:bg-gray-400": shouldBeTransparent && !isScrolled,
                        "text-black hover:text-gray-400 after:bg-gray-400": isScrolled || !shouldBeTransparent
                      }
                    )}
                  >
                    хиты продаж
                  </LocalizedClientLink>
                </li>
                
                {/* <li>
                  <LocalizedClientLink
                    href="/promotions"
                    className={clx(
                      "text-[16px] font-normal transition-colors duration-200 relative hover:after:w-full after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200",
                      {
                        "text-white group-hover:text-black hover:text-gray-400 group-hover:hover:text-gray-400 after:bg-gray-400 group-hover:after:bg-gray-400": shouldBeTransparent && !isScrolled,
                        "text-black hover:text-gray-400 after:bg-gray-400": isScrolled || !shouldBeTransparent
                      }
                    )}
                  >
                    акции
                  </LocalizedClientLink>
                </li> */}
                {/* <li>
                  <LocalizedClientLink
                    href="/brands"
                    className={clx(
                      "text-[16px] font-normal transition-colors duration-200 relative hover:after:w-full after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200",
                      {
                        "text-white group-hover:text-black hover:text-gray-400 group-hover:hover:text-gray-400 after:bg-gray-400 group-hover:after:bg-gray-400": shouldBeTransparent && !isScrolled,
                        "text-black hover:text-gray-400 after:bg-gray-400": isScrolled || !shouldBeTransparent
                      }
                    )}
                  >
                    бренды
                  </LocalizedClientLink>
                </li> */}
                
                <li>
                  <LocalizedClientLink
                    href="/blog"
                    className={clx(
                      "text-[16px] font-normal transition-colors duration-200 relative hover:after:w-full after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200",
                      {
                        "text-white group-hover:text-black hover:text-gray-400 group-hover:hover:text-gray-400 after:bg-gray-400 group-hover:after:bg-gray-400": shouldBeTransparent && !isScrolled,
                        "text-black hover:text-gray-400 after:bg-gray-400": isScrolled || !shouldBeTransparent
                      }
                    )}
                  >
                    блог
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/contacts"
                    className={clx(
                      "text-[16px] font-normal transition-colors duration-200 relative hover:after:w-full after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-0 after:transition-all after:duration-200",
                      {
                        "text-white group-hover:text-black hover:text-gray-400 group-hover:hover:text-gray-400 after:bg-gray-400 group-hover:after:bg-gray-400": shouldBeTransparent && !isScrolled,
                        "text-black hover:text-gray-400 after:bg-gray-400": isScrolled || !shouldBeTransparent
                      }
                    )}
                  >
                    контакты
                  </LocalizedClientLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        
        <CatalogDropdown
          isVisible={showCatalogDropdown}
          onClose={() => setShowCatalogDropdown(false)}
          onMouseEnter={handleDropdownMouseEnter}
          onMouseLeave={handleDropdownMouseLeave}
        />
        
        {!isHome && !isStorePage && (
          <div className="bg-[#BAFF29] h-[45px] flex items-center justify-center transition-colors duration-200 hover:text-gray-400 cursor-pointer">
            <div className="flex items-center justify-center w-full">
              <span 
                className="text-black transition-colors duration-200"
                style={{ 
                  fontSize: "13px",
                  fontWeight: 500
                }}
              >
                дополнительная скидка -25% по промокоду ВМЕСТЕ
              </span>
            </div>
          </div>
        )}
        
      </div>
    </>
  )
}

export default Nav
