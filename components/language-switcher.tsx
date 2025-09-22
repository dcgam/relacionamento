"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { setLanguage, detectLanguage, type Language } from "@/lib/i18n"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function LanguageSwitcher() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>("pt")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setCurrentLanguage(detectLanguage())

    const handleLanguageChange = () => {
      setCurrentLanguage(detectLanguage())
    }

    window.addEventListener("languageChange", handleLanguageChange)
    return () => window.removeEventListener("languageChange", handleLanguageChange)
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    console.log("[v0] Changing language to:", newLanguage)
    setLanguage(newLanguage)
    setCurrentLanguage(newLanguage)
    setIsOpen(false)
    // Force page reload to update all translations
    window.location.reload()
  }

  const getFlag = (lang: Language) => {
    if (lang === "pt") {
      return <span className="mr-2 text-base">🇧🇷</span>
    }
    return <span className="mr-2 text-base">🇪🇸</span>
  }

  const getLanguageName = (lang: Language) => {
    return lang === "pt" ? "Português" : "Español"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-background border-border hover:bg-accent min-w-[120px]"
          onClick={() => {
            console.log("[v0] Language selector clicked, current state:", isOpen)
            setIsOpen(!isOpen)
          }}
        >
          {getFlag(currentLanguage)}
          <span className="text-sm font-medium">{getLanguageName(currentLanguage)}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 z-50">
        <DropdownMenuItem
          onClick={() => changeLanguage("pt")}
          className={`cursor-pointer ${currentLanguage === "pt" ? "bg-accent" : ""}`}
        >
          🇧🇷
          <span className="ml-2">Português</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => changeLanguage("es")}
          className={`cursor-pointer ${currentLanguage === "es" ? "bg-accent" : ""}`}
        >
          🇪🇸
          <span className="ml-2">Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
