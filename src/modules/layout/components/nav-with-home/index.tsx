'use client'

import Nav from "@modules/layout/templates/nav"
import { usePathname } from "next/navigation"

export default function NavWithHome({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  
  // Проверяем, находимся ли мы на главной странице
  // Главная: /[countryCode] или /[countryCode]/
  const isHome = pathname === `/${countryCode}` || pathname === `/${countryCode}/`
  
  // Передаем флаг isHome в компонент Nav
  return <Nav isHome={isHome} />
} 