"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Check,
  Heart,
  Menu,
  MessageCircle,
  Moon,
  QrCode,
  Smartphone,
  Star,
  Sun,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");

  const features = [
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Tu carta online personalizada",
      description: "menudata.com/elnombredeturestaurante",
    },
    {
      icon: <Menu className="h-6 w-6" />,
      title: "Separada por categorías",
      description: "Entradas, principales, postres, bebidas...",
    },
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "Link y QR personalizado",
      description: "Descargable y compartible",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Diseño adaptado a celular",
      description: "Visual atractivo y responsive",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Carga inicial incluida",
      description: "Nos pasás tu carta por WhatsApp y nosotros la subimos",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Actualización automática mensual",
      description: "Precios actualizados por inflación",
    },
  ];

  const additionalFeatures = [
    {
      icon: <Star className="h-6 w-6" />,
      title: "Reseñas de clientes",
      description: "Opción según el plan elegido",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Estadísticas básicas",
      description:
        "Platos más vistos y cantidad de visitas (plan intermedio y premium)",
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Soporte por WhatsApp",
      description: "Directo, claro y humano 💬",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Sin complicaciones",
      description: "Sin apps, sin instalaciones",
    },
  ];

  const plans = [
    {
      name: "GRATUITO",
      price: "Gratis",
      period: "",
      color: "bg-brand-accent-100",
      textColor: "text-brand-text-200",
      description: "Ideal para menús breves o food trucks",
      features: [
        "Hasta 25 platos",
        "Sin reseñas ni estadísticas",
        "La carga de los platos es por parte del cliente",
        "Link y QR personalizado",
        "Actualización mensual de precios",
        "Soporte técnico por WhatsApp",
      ],
      popular: false,
    },
    {
      name: "INTERMEDIO",
      price: "$19.99",
      period: "/mes",
      color: "bg-[#F4A261]",
      textColor: "text-brand-text-100",
      description: "Ideal para restaurantes medianos",
      features: [
        "Hasta 50 platos",
        "Incluye reseñas y estadísticas básicas",
        "Carga de platos a cargo de nuestro equipo",
        "Link y QR personalizado",
        "Actualización mensual de precios",
        "Soporte técnico por WhatsApp",
      ],
      popular: true,
    },
    {
      name: "PREMIUM",
      price: "$39.99",
      period: "/mes",
      color: "bg-brand-primary-100",
      textColor: "text-brand-text-100",
      description: "Ideal para restaurantes grandes o con mucha variedad",
      features: [
        "Platos ilimitados",
        "Reseñas, estadísticas y analíticas de visitas",
        "Platos destacados (opcional)",
        "Carga de platos y fotos incluida",
        "Diseño de carta personalizado",
        "Creación de logo simple sin costo adicional",
        "Soporte prioritario por WhatsApp",
      ],
      popular: false,
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Elegís tu plan",
      description: "Seleccioná el plan que mejor se adapte a tu restaurante",
    },
    {
      step: "2",
      title: "Enviás tu carta",
      description:
        "Por WhatsApp o formulario (platos, precios, categorías y fotos)",
    },
    {
      step: "3",
      title: "Publicamos tu carta",
      description: "En 24 a 48 hs, tu carta está lista y funcionando",
    },
    {
      step: "4",
      title: "Recibís link y QR",
      description: "Te mandamos todo listo para imprimir o compartir",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-brand-primary-300 bg-white/80 backdrop-blur-md dark:bg-brand-primary-300/80 dark:border-brand-bg-300">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="h-14 w-14 rounded-full bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
              <Image
                src={"/logo-1.jpg"}
                alt="Logo"
                width={75}
                height={75}
                quality={100}
                className="rounded-full overflow-hidden"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 bg-clip-text text-transparent">
              MenuData
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-brand-text-100 hover:text-brand-primary-100 dark:text-gray-300 dark:hover:text-brand-primary-100 transition-colors"
            >
              Características
            </Link>
            <Link
              href="#plans"
              className="text-brand-text-100 hover:text-brand-primary-100 dark:text-gray-300 dark:hover:text-brand-primary-100 transition-colors"
            >
              Planes
            </Link>
            <Link
              href="#how-it-works"
              className="text-brand-text-100 hover:text-brand-primary-100 dark:text-gray-300 dark:hover:text-brand-primary-100 transition-colors"
            >
              Cómo funciona
            </Link>
            <Link
              href="#about"
              className="text-brand-text-100 hover:text-brand-primary-100 dark:text-gray-300 dark:hover:text-brand-primary-100 transition-colors"
            >
              Nosotros
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Button className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white">
              Comenzar Ahora
            </Button>
          </nav>

          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="#features"
                    className="text-brand-text hover:text-brand-primary"
                  >
                    Características
                  </Link>
                  <Link
                    href="#plans"
                    className="text-brand-text hover:text-brand-primary"
                  >
                    Planes
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="text-brand-text hover:text-brand-primary"
                  >
                    Cómo funciona
                  </Link>
                  <Link
                    href="#about"
                    className="text-brand-text hover:text-brand-primary"
                  >
                    Nosotros
                  </Link>
                  <Button className="bg-brand-primary hover:bg-brand-hover text-white mt-4">
                    Comenzar Ahora
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-brand-primary-100/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-brand-primary-200/30 rounded-full blur-lg animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-brand-accent-100/20 rounded-full blur-2xl animate-float-delayed-2"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-brand-primary-200/25 rounded-full blur-md animate-bounce-slow"></div>
        </div>

        <div className="container mx-auto text-center relative z-10">
          {/* Badge with animation */}
          <div className="mb-8 animate-pulse-slow">
            <Badge className="mb-4 bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 text-white border-0 px-6 py-2 text-sm font-medium shadow-lg">
              📱 Nada de PDFs lentos ni links desordenados
            </Badge>
          </div>

          {/* Main headline with gradient and animations */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="block bg-gradient-to-r from-brand-text-200 via-brand-primary-300 to-brand-text-100 bg-clip-text text-transparent">
                Tu carta digital.
              </span>
              <span className="block bg-gradient-to-r from-brand-primary-100 via-brand-primary-200 to-brand-primary-100 bg-clip-text text-transparent animate-pulse-slow">
                Siempre actualizada.
              </span>
              <span className="block bg-gradient-to-r from-brand-primary-200 via-brand-accent-200 to-brand-primary-200 bg-clip-text text-transparent">
                Siempre impecable.
              </span>
            </h1>
          </div>

          {/* Intro text with modern card design */}
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-brand-primary-300/20 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-brand-bg-300/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-left space-y-4">
                  <p className="text-2xl font-bold text-brand-text-100 dark:text-white">
                    <span className="text-4xl">Hola 👋</span>
                  </p>
                  <p className="text-lg text-brand-text-100 dark:text-white leading-relaxed">
                    Sabemos lo importante que es para tu restaurante ofrecer un
                    servicio{" "}
                    <span className="font-semibold text-brand-primary-200">
                      ágil, moderno y claro.
                    </span>
                  </p>
                  <p className="text-lg text-brand-text-100 dark:text-white leading-relaxed">
                    <strong className="text-brand-primary-100">Menudata</strong>{" "}
                    es una plataforma digital donde podés publicar tu menú
                    online y permitir que tus clientes lo vean desde su celular,{" "}
                    <span className="font-semibold text-brand-accent-200">
                      con solo escanear un QR.
                    </span>
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-brand-accent-100 to-brand-primary-200 p-6 rounded-2xl shadow-xl">
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <QrCode className="h-16 w-16 mx-auto text-brand-primary-300" />
                    </div>
                    <p className="text-white font-bold text-center">
                      Una carta digital,
                      <br />
                      rápida, clara y profesional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons with modern design */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white text-xl px-12 py-4 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold"
            >
              🚀 Crear Mi Menú Gratis
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-xl px-12 py-4 rounded-2xl border-2 border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white bg-transparent shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
            >
              👀 Ver Demo
            </Button>
          </div>

          {/* Modern menu preview */}
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-100/20 to-brand-primary-200/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/90 dark:bg-brand-primary-300/30 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-brand-bg-300/50">
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brand-primary-100 to-brand-accent-200 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                  <span>🌐</span>
                  <span>menudata.com/turestaurante</span>
                </div>
                <div className="flex justify-center space-x-6 text-brand-text-100 mt-6 overflow-x-auto">
                  <div className="flex items-center space-x-2 bg-brand-bg-200 px-4 py-2 rounded-full">
                    <span>🍕</span>
                    <span className="font-medium">Entradas</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-brand-bg-200 px-4 py-2 rounded-full">
                    <span>🥘</span>
                    <span className="font-medium">Principales</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-brand-bg-200 px-4 py-2 rounded-full">
                    <span>🍰</span>
                    <span className="font-medium">Postres</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-brand-bg-200 px-4 py-2 rounded-full">
                    <span>🥤</span>
                    <span className="font-medium">Bebidas</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-brand-primary-100/20 to-brand-primary-200/20 p-6 rounded-2xl border border-brand-primary-100/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-brand-text-200 dark:text-white text-lg">
                      Pizza Margherita
                    </h4>
                    <Star className="h-5 w-5 text-brand-primary-200 fill-current" />
                  </div>
                  <p className="text-brand-text-100 dark:text-white mb-3">
                    Tomate, mozzarella, albahaca fresca
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-black text-2xl text-brand-primary-100">
                      $2.500
                    </p>
                    <Badge className="bg-brand-accent-100 text-brand-text-200">
                      Popular
                    </Badge>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-brand-accent-100/20 to-brand-accent-200/20 p-6 rounded-2xl border border-brand-accent-100/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-brand-text-200 dark:text-white text-lg">
                      Milanesa Napolitana
                    </h4>
                    <Heart className="h-5 w-5 text-brand-primary-200" />
                  </div>
                  <p className="text-brand-text-100 dark:text-white mb-3">
                    Con papas fritas caseras
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-black text-2xl text-brand-accent-200">
                      $3.200
                    </p>
                    <Badge className="bg-brand-primary-200 text-white">
                      Nuevo
                    </Badge>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-brand-primary-200/20 to-brand-primary-100/20 p-6 rounded-2xl border border-brand-primary-200/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-brand-text-200 dark:text-white text-lg">
                      Tiramisu Casero
                    </h4>
                    <Zap className="h-5 w-5 text-brand-primary-100" />
                  </div>
                  <p className="text-brand-text-100 dark:text-white mb-3">
                    Receta tradicional italiana
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-black text-2xl text-brand-primary-200">
                      $1.800
                    </p>
                    <Badge className="bg-brand-accent-200 text-white">
                      Chef
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-brand-text-100 font-medium">
                  ✨ <span className="font-bold">Actualización automática</span>{" "}
                  • 📱 <span className="font-bold">Responsive</span> • ⚡{" "}
                  <span className="font-bold">Carga rápida</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-black">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-text-100 dark:text-white">
              ✅ ¿Qué incluye el servicio?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-brand-accent-100 dark:border-brand-primary-100 hover:shadow-lg transition-shadow bg-white dark:bg-brand-primary-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-brand-accent-100 dark:bg-brand-primary-100 rounded-lg flex items-center justify-center text-white mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-brand-text-100">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-brand-text-100/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card
                key={index}
                className="border-brand-primary-100 hover:shadow-lg transition-shadow bg-brand-hover/10"
              >
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-brand-primary-200 rounded-lg flex items-center justify-center text-white mb-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-sm text-brand-text">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-xs text-brand-text/70">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-brand-accent/30 p-6 rounded-2xl max-w-2xl mx-auto">
              <p className="text-brand-text font-medium">
                📸 <strong>Las fotos son optativas.</strong> Si las tenés, las
                cargamos. Si no, tu carta funciona igual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 bg-brand-bg-100">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-text-100">
              🛠️ ¿Cómo funciona?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-brand-primary-100 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-brand-text-100">
                  {step.title}
                </h3>
                <p className="text-brand-text-200">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="plans"
        className="py-20 px-4 bg-background relative py-20 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-brand-primary-100/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-brand-primary-200/30 rounded-full blur-lg animate-float-delayed"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-brand-accent-100/20 rounded-full blur-2xl animate-float-delayed-2"></div>
          <div className="absolute top-1/2 right-10 w-20 h-20 bg-brand-primary-200/25 rounded-full blur-md animate-bounce-slow"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-text-100 dark:text-white">
              💰 PLANES
            </h2>
            <div className="bg-brand-accent/30 p-4 rounded-lg max-w-2xl mx-auto">
              <p className="text-brand-text font-medium">
                💡 <strong>Todos los planes incluyen:</strong> Carga inicial sin
                costo • Actualización mensual de precios • Link y QR
                personalizado • Soporte técnico por WhatsApp
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative bg-white ${
                  plan.popular
                    ? "border-brand-primary-100 shadow-xl scale-105"
                    : "border-brand-primary-300 dark:border-gray-700"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-brand-primary-100 text-white">
                    Más Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2 ${plan.color} ${plan.textColor}`}
                  >
                    {plan.name}
                  </div>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-brand-primary-200">
                      {plan.price}
                    </span>
                    <span className="text-brand-text/70 dark:text-brand-primary-200 ml-1">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="text-brand-text/70 dark:text-brand-primary-100">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start space-x-3"
                      >
                        <Check className="h-5 w-5 text-brand-accent dark:text-brand-primary-300 mt-0.5 flex-shrink-0" />
                        <span className="text-brand-text/80 dark:text-brand-primary-200 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-brand-primary-100 hover:bg-brand-hover text-white"
                        : "bg-brand-text-100 hover:bg-brand-text/80 text-white dark:bg-gray-600 dark:hover:bg-gray-500"
                    }`}
                  >
                    Comenzar con {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-text">
              🤝 ¿Por qué confiar en nosotros?
            </h2>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-brand-text-100 p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-8">
                <div className="flex justify-center items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 dark:text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-brand-text dark:text-brand-primary-300 mb-4">
                  Melanie & Jeremías
                </h3>
              </div>
              <div className="space-y-4 text-brand-text dark:text-brand-primary-300">
                <p>
                  Somos <strong>Jeremías Arriondo y Melanie Reynoso</strong>,
                  desarrolladores, con experiencia y recomendaciones, un
                  matrimonio que vive en Argentina.
                </p>
                <p>
                  Creamos Menudata con una idea clara:{" "}
                  <strong>
                    ayudarte a modernizar tu carta sin que tengas que
                    preocuparte por lo técnico.
                  </strong>
                </p>
                <p>
                  Sabemos lo que significa emprender, y por eso nos tomamos en
                  serio cada detalle.
                </p>
                <div className="bg-brand-accent/30 p-4 rounded-lg">
                  <p className="font-semibold text-brand-text">
                    🛎️ No usamos bots. No hay letra chica. Solo trabajo real,
                    con personas reales.
                  </p>
                </div>
                <p className="text-center font-medium">
                  Nos mandás tu carta y la tenés lista en 2 días.
                  <br />
                  Cualquier duda, estamos del otro lado del mensaje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-text-100 dark:text-black">
            📲 ¿Querés ver cómo se ve?
          </h2>
          <p className="text-xl text-brand-text-200 dark:text-brand-primary-300 mb-8 max-w-2xl mx-auto">
            Pedinos un ejemplo y te mandamos un demo como si fueras un cliente.
          </p>
          <p className="text-lg text-brand-text-200 dark:text-brand-primary-300 mb-8">
            🎯{" "}
            <strong>
              Empezá a mejorar la experiencia de tus comensales por muy poco y
              en muy poco tiempo.
            </strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
            />
            <Button className="bg-white text-brand-primary hover:bg-brand-background font-semibold px-8">
              Pedir Demo
            </Button>
          </div>
          <p className="dark:text-white text-lg">
            Te esperamos,
            <br />
            <strong>Melanie & Jeremías – Menudata</strong>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-brand-primary-100 text-white dark:text-black">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center">
                  <Menu className="h-5 w-5 text-white dark:text-black" />
                </div>
                <span className="text-xl font-bold">MenuData</span>
              </div>
              <p className="text-gray-200 dark:text-gray-800">
                Tu carta digital. Siempre actualizada. Siempre impecable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-200 dark:text-gray-800">
                <li>
                  <Link href="#features" className="hover:text-brand-primary">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#plans" className="hover:text-brand-primary">
                    Planes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand-primary">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-200 dark:text-gray-800">
                <li>
                  <Link href="#" className="hover:text-brand-primary">
                    WhatsApp
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand-primary">
                    Preguntas Frecuentes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-brand-primary">
                    Tutoriales
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-200 dark:text-gray-800">
                <li>📱 WhatsApp: +54 9 11 1234-5678</li>
                <li>📧 hola@menudata.com</li>
                <li>🌐 menudata.com</li>
                <li>📍 Rojas, Buenos Aires</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-200 dark:text-gray-800">
            <p>&copy; 2024 MenuData. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
