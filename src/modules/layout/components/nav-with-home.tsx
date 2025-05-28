'use client'

import Nav from "@modules/layout/templates/nav"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function NavWithHome({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [isHome, setIsHome] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    // Только главная страница считается "домашней" (без зеленой полоски)
    const isHomePage = pathname === `/${countryCode}` || pathname === `/${countryCode}/` || pathname === '/'
    setIsHome(isHomePage)
  }, [pathname, countryCode])
  
  // Предотвращаем гидратацию - показываем одинаковое состояние на сервере и клиенте
  if (!isClient) {
    return <Nav isHome={false} />
  }
  
  // Каталог и категории должны иметь прозрачную шапку, но показывать зеленую полоску
  const isCatalogPage = pathname === `/${countryCode}/store` || pathname === `/${countryCode}/store/`
  const isCategoryPage = pathname.includes('/categories')
  const isTransparent = isHome || isCatalogPage || isCategoryPage
  
  return <Nav isHome={isHome} isTransparent={isTransparent} />
} 