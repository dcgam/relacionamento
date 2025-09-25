"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Mail, Lock, Shield } from "lucide-react"
import Link from "next/link"

export default function LoginSimplePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isAdminMode, setIsAdminMode] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (isAdminMode) {
        if (email === "admin@renovese.com" && password === "admin123") {
          localStorage.setItem("adminSession", "true")
          localStorage.setItem("userEmail", email)
          localStorage.setItem("userLanguage", "en")

          // Set cookie for server-side middleware
          document.cookie = "adminSession=true; path=/; max-age=86400" // 24 hours

          window.location.href = "/admin-panel"
          return
        } else {
          throw new Error("Invalid login credentials")
        }
      } else {
        // For regular users, redirect to register for now
        window.location.href = "/register"
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isAdminMode ? "bg-blue-600" : "bg-pink-600"
              }`}
            >
              {isAdminMode ? <Shield className="w-8 h-8 text-white" /> : <Heart className="w-8 h-8 text-white" />}
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">{isAdminMode ? "Admin - Renove-se" : "Welcome"}</h1>
            <p className="text-gray-600">
              {isAdminMode ? "Acesso exclusivo para administradores" : "Start your transformation"}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsAdminMode(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAdminMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Usuário
            </button>
            <button
              type="button"
              onClick={() => setIsAdminMode(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAdminMode ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-gray-900">
              {isAdminMode ? "Acesso Administrativo" : "Start Transformation"}
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {isAdminMode ? "Entre com suas credenciais de admin" : "Enter your email"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder={isAdminMode ? "admin@renovese.com" : "Email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 h-12 text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className={`w-full h-12 text-base font-medium ${
                  isAdminMode ? "bg-blue-600 hover:bg-blue-700" : "bg-pink-600 hover:bg-pink-700"
                } text-white`}
                disabled={isLoading}
              >
                {isLoading ? (isAdminMode ? "Verificando..." : "Sending...") : isAdminMode ? "Acessar Painel" : "Start"}
              </Button>
            </form>

            {!isAdminMode && (
              <>
                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-pink-600 hover:underline">
                    Forgot Password
                  </Link>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-pink-600 hover:underline font-medium">
                      Register here
                    </Link>
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Admin Credentials Info */}
        {isAdminMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-lg">ℹ️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Credenciales de prueba</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    <strong>Email:</strong> admin@renovese.com
                  </p>
                  <p>
                    <strong>Password:</strong> admin123
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">Terms and Conditions apply</p>
        </div>
      </div>
    </div>
  )
}
