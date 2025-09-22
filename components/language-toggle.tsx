"use client"

import { Languages } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LANGUAGE_SELECTOR_EN, LANGUAGE_SELECTOR_ES } from "@/lib/text-languages"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("EN")}>{LANGUAGE_SELECTOR_EN}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("ES")}>{LANGUAGE_SELECTOR_ES}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
