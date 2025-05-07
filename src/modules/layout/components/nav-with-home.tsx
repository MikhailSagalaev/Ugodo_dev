'use client'

import Nav from "@modules/layout/templates/nav"
import { usePathname } from "next/navigation"

export default function NavWithHome({ countryCode }: { countryCode: string }) {
  const pathname = usePathname()
  // Главная: /[countryCode] или /[countryCode]/
  const isHome = pathname === `/${countryCode}` || pathname === `/${countryCode}/`
  return <Nav isHome={isHome} />
} 