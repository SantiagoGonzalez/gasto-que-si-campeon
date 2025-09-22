"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useLanguage } from "@/lib/language-context"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  THEME_LIGHT_EN,
  THEME_LIGHT_ES,
  THEME_DARK_EN,
  THEME_DARK_ES,
  THEME_SYSTEM_EN,
  THEME_SYSTEM_ES,
} from "@/lib/text-languages"

export function ModeToggle() {
  const { setTheme } = useTheme()
  const { language } = useLanguage()

  const getThemeText = (theme: string) => {
    switch (theme) {
      case "light":
        return language === "EN" ? THEME_LIGHT_EN : THEME_LIGHT_ES
      case "dark":
        return language === "EN" ? THEME_DARK_EN : THEME_DARK_ES
      case "system":
        return language === "EN" ? THEME_SYSTEM_EN : THEME_SYSTEM_ES
      default:
        return theme
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>{getThemeText("light")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>{getThemeText("dark")}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>{getThemeText("system")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
