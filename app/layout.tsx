import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Renove-se - Guia para Relacionamentos",
  description:
    "Plataforma digital que oferece guia e suporte para mulheres que buscam recuperar e fortalecer seus relacionamentos",
  generator: "Renove-se",
  manifest: "/manifest.json",
  keywords: ["relacionamentos", "mulheres", "autoajuda", "renovação", "amor"],
  authors: [{ name: "Renove-se" }],
  icons: {
    icon: "/icon-192x192.jpg",
    shortcut: "/icon-192x192.jpg",
    apple: "/icon-192x192.jpg",
  },
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  themeColor: "#0A1C41",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
