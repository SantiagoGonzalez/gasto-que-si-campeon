"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "EN" | "ES"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getSystemLanguage(): Language {
  if (typeof window === "undefined") return "EN"

  const systemLang = navigator.language || navigator.languages?.[0] || "en"
  const langCode = systemLang.toLowerCase().split("-")[0]

  return langCode === "es" ? "ES" : "EN"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(getSystemLanguage())

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "EN" || savedLanguage === "ES")) {
      setLanguage(savedLanguage)
    } else {
      const systemLang = getSystemLanguage()
      setLanguage(systemLang)
      localStorage.setItem("language", systemLang)
    }
  }, [])

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
