"use client"

import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Button
        variant={language === "pt" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("pt")}
        className={`text-xs px-2 py-1 ${
          language === "pt"
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-white/10 hover:bg-white/20 text-white border-white/30"
        }`}
      >
        🇧🇷 PT
      </Button>
      <Button
        variant={language === "es" ? "default" : "outline"}
        size="sm"
        onClick={() => setLanguage("es")}
        className={`text-xs px-2 py-1 ${
          language === "es"
            ? "bg-rose-500 hover:bg-rose-600 text-white"
            : "bg-white/10 hover:bg-white/20 text-white border-white/30"
        }`}
      >
        🇪🇸 ES
      </Button>
    </div>
  )
}
