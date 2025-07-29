"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/components/auth-provider"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const { signInWithGoogle, signUpWithEmail, isConfigured } = useAuth()

  // Redirect to home if Supabase is not configured
  useEffect(() => {
    if (!isConfigured) {
      router.push("/")
    }
  }, [isConfigured, router])

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-brand-accent-100 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-text-200 mb-2">Modo Demo</h2>
            <p className="text-brand-text-100 mb-4">
              La autenticación no está configurada. Esta es una versión de demostración.
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Rest of the component logic remains the same...
  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true)
      setError("")
      await signInWithGoogle()
    } catch (error: any) {
      setError("Error al registrarse con Google")
      console.error("Google sign up error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones")
      return
    }

    try {
      setIsLoading(true)
      setError("")

      const { error: signUpError } = await signUpWithEmail(formData.email, formData.password, formData.name)

      if (signUpError) {
        setError(signUpError)
      } else {
        setSuccess("¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.")
        // Opcional: redirigir después de un tiempo
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      }
    } catch (error: any) {
      setError("Error al crear la cuenta")
      console.error("Email sign up error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-32 h-32 bg-brand-accent-100/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-brand-primary-200/10 rounded-full blur-lg animate-float-delayed"></div>
        <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-brand-primary-100/10 rounded-full blur-2xl animate-float-delayed-2"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-brand-text-100 hover:text-brand-primary-100 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 bg-clip-text text-transparent">
              MenuData
            </span>
          </div>

          <h1 className="text-3xl font-bold text-brand-text-200 mb-2">¡Únete a MenuData!</h1>
          <p className="text-brand-text-100">Crea tu cuenta y moderniza tu restaurante</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-brand-bg-300 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-brand-text-200">Crear Cuenta</CardTitle>
            <CardDescription className="text-center text-brand-text-100">
              Tu menú digital estará listo en 24 horas
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-brand-primary-200 bg-brand-primary-200/10">
                <AlertDescription className="text-brand-primary-200">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign Up */}
            <Button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
              size="lg"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Creando cuenta..." : "Registrarse con Google"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-brand-text-100">O completa el formulario</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-brand-text-200">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-brand-text-100" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-brand-text-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-brand-text-100" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-brand-text-200">
                  Teléfono (opcional)
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-brand-text-100" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-brand-text-200">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-text-100" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-brand-text-100" />
                    ) : (
                      <Eye className="h-4 w-4 text-brand-text-100" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-brand-text-200">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-brand-text-100" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-brand-text-100" />
                    ) : (
                      <Eye className="h-4 w-4 text-brand-text-100" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="terms" checked={acceptTerms} onCheckedChange={setAcceptTerms} />
                <Label htmlFor="terms" className="text-sm text-brand-text-100">
                  Acepto los{" "}
                  <Link href="/terms" className="text-brand-primary-100 hover:underline">
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link href="/privacy" className="text-brand-primary-100 hover:underline">
                    política de privacidad
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !acceptTerms}
                className="w-full bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
                size="lg"
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta Gratis"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-brand-text-100">
                ¿Ya tienes una cuenta?{" "}
                <Link
                  href="/login"
                  className="text-brand-primary-100 hover:text-brand-primary-200 hover:underline font-medium"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-brand-bg-300">
            <h3 className="font-bold text-brand-text-200 mb-4 text-center">🎉 ¿Por qué elegir MenuData?</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-accent-100 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⚡</span>
                </div>
                <div>
                  <p className="font-medium text-brand-text-200 text-sm">Setup en 24 horas</p>
                  <p className="text-xs text-brand-text-100">Tu menú estará funcionando mañana</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">💬</span>
                </div>
                <div>
                  <p className="font-medium text-brand-text-200 text-sm">Soporte humano</p>
                  <p className="text-xs text-brand-text-100">Sin bots, personas reales te ayudan</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-brand-accent-200 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🆓</span>
                </div>
                <div>
                  <p className="font-medium text-brand-text-200 text-sm">Plan gratuito disponible</p>
                  <p className="text-xs text-brand-text-100">Hasta 25 platos sin costo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
