"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { setLanguage, detectLanguage, type Language } from "@/lib/i18n"

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

  const BrazilFlag = () => (
    <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-300 flex-shrink-0">
      <div className="w-full h-1/2 bg-green-500"></div>
      <div className="w-full h-1/2 bg-yellow-400"></div>
    </div>
  )

  const SpainFlag = () => (
    <div className="w-5 h-4 rounded-sm overflow-hidden border border-gray-300 flex-shrink-0">
      <div className="w-full h-1/4 bg-red-600"></div>
      <div className="w-full h-2/4 bg-yellow-400"></div>
      <div className="w-full h-1/4 bg-red-600"></div>
    </div>
  )

  const getLanguageDisplay = (lang: Language) => {
    if (lang === "pt") {
      return (
        <>
          <BrazilFlag />
          <span className="ml-2 text-sm font-medium">PT</span>
        </>
      )
    }
    return (
      <>
        <SpainFlag />
        <span className="ml-2 text-sm font-medium">ES</span>
      </>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1 bg-background border-border hover:bg-accent min-w-[80px]"
        onClick={() => {
          console.log("[v0] Language selector clicked, current state:", isOpen)
          setIsOpen(!isOpen)
        }}
      >
        {getLanguageDisplay(currentLanguage)}
        <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown content */}
          <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <div
              onClick={() => changeLanguage("pt")}
              className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                currentLanguage === "pt" ? "bg-gray-50" : ""
              }`}
            >
              <BrazilFlag />
              <span className="ml-2 text-sm">PT-BR</span>
            </div>
            <div
              onClick={() => changeLanguage("es")}
              className={`flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                currentLanguage === "es" ? "bg-gray-50" : ""
              }`}
            >
              <SpainFlag />
              <span className="ml-2 text-sm">ES</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
