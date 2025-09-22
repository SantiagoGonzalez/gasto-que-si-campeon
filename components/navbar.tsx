"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/lib/language-context"
import { Home, Users, PlusCircle, Calendar } from "lucide-react"
import {
  NAVBAR_HOME_EN,
  NAVBAR_HOME_ES,
  NAVBAR_GATHERINGS_EN,
  NAVBAR_GATHERINGS_ES,
  NAVBAR_USERS_EN,
  NAVBAR_USERS_ES,
  NAVBAR_NEW_EN,
  NAVBAR_NEW_ES,
} from "@/lib/text-languages"

export function Navbar() {
  const pathname = usePathname()
  const { language } = useLanguage()

  const getText = (enText: string, esText: string) => {
    return language === "EN" ? enText : esText
  }

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container flex h-14 sm:h-16 items-center px-2 sm:px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg sm:text-xl">GQSC</span>
        </Link>
        <nav className="ml-auto flex items-center gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
          <Link href="/">
            <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" className="h-8 sm:h-9">
              <Home className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{getText(NAVBAR_HOME_EN, NAVBAR_HOME_ES)}</span>
            </Button>
          </Link>
          <Link href="/gatherings">
            <Button
              variant={pathname.startsWith("/gatherings") && pathname !== "/gatherings/new" ? "default" : "ghost"}
              size="sm"
              className="h-8 sm:h-9"
            >
              <Calendar className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{getText(NAVBAR_GATHERINGS_EN, NAVBAR_GATHERINGS_ES)}</span>
            </Button>
          </Link>
          <Link href="/users">
            <Button variant={pathname === "/users" ? "default" : "ghost"} size="sm" className="h-8 sm:h-9">
              <Users className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">{getText(NAVBAR_USERS_EN, NAVBAR_USERS_ES)}</span>
            </Button>
          </Link>
          <Link href="/gatherings/new">
            <Button variant="outline" size="sm" className="gap-1 h-8 sm:h-9 bg-transparent">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{getText(NAVBAR_NEW_EN, NAVBAR_NEW_ES)}</span>
            </Button>
          </Link>
          <LanguageToggle />
          <ModeToggle />
        </nav>
      </div>
    </header>
  )
}
