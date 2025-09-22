"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe, ChevronDown } from "lucide-react"
import { setLanguage, detectLanguage, type Language } from "@/lib/i18n"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("pt")

  useEffect(() => {
    setCurrentLanguage(detectLanguage())

    const handleLanguageChange = () => {
      setCurrentLanguage(detectLanguage())
    }

    window.addEventListener("languageChange", handleLanguageChange)
    return () => window.removeEventListener("languageChange", handleLanguageChange)
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    setCurrentLanguage(newLanguage)
    // Force page reload to update all translations
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-background border-border hover:bg-accent"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{currentLanguage === "pt" ? "Português" : "Español"}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => changeLanguage("pt")} className={currentLanguage === "pt" ? "bg-accent" : ""}>
          <span className="mr-2">🇧🇷</span>
          Português
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("es")} className={currentLanguage === "es" ? "bg-accent" : ""}>
          <span className="mr-2">🇪🇸</span>
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
