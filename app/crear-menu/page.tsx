"use client";

import type React from "react";

import { useAuth } from "@/components/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Check,
  Edit,
  Eye,
  GripVertical,
  Loader2,
  Palette,
  Plus,
  QrCode,
  Save,
  Smartphone,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  featured: boolean;
  image?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

interface MenuTheme {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  style: {
    borderRadius: string;
    fontFamily: string;
    cardStyle: string;
    headerStyle: string;
  };
}

const menuThemes: MenuTheme[] = [
  {
    id: "clasico",
    name: "Clásico",
    description: "Diseño tradicional y elegante",
    preview: "🏛️",
    colors: {
      primary: "#F84E93",
      secondary: "#F179B6",
      accent: "#FEDA00",
      background: "#FFF1F7",
      card: "#FFFFFF",
      text: "#2E2E2E",
      textSecondary: "#6A6A6A",
    },
    style: {
      borderRadius: "rounded-xl",
      fontFamily: "font-serif",
      cardStyle: "shadow-md border",
      headerStyle: "text-center",
    },
  },
  {
    id: "moderno",
    name: "Moderno",
    description: "Minimalista y contemporáneo",
    preview: "✨",
    colors: {
      primary: "#000000",
      secondary: "#333333",
      accent: "#FF6B6B",
      background: "#FFFFFF",
      card: "#F8F9FA",
      text: "#000000",
      textSecondary: "#666666",
    },
    style: {
      borderRadius: "rounded-none",
      fontFamily: "font-sans",
      cardStyle: "border-l-4 border-l-black",
      headerStyle: "text-left",
    },
  },
  {
    id: "elegante",
    name: "Elegante",
    description: "Sofisticado y premium",
    preview: "💎",
    colors: {
      primary: "#1A1A1A",
      secondary: "#8B7355",
      accent: "#D4AF37",
      background: "#F5F5F0",
      card: "#FFFFFF",
      text: "#1A1A1A",
      textSecondary: "#8B7355",
    },
    style: {
      borderRadius: "rounded-lg",
      fontFamily: "font-serif",
      cardStyle: "shadow-lg border-2 border-gray-100",
      headerStyle: "text-center border-b-2 border-gray-200 pb-2",
    },
  },
  {
    id: "colorido",
    name: "Colorido",
    description: "Vibrante y divertido",
    preview: "🌈",
    colors: {
      primary: "#FF6B6B",
      secondary: "#4ECDC4",
      accent: "#45B7D1",
      background: "#FFF8E1",
      card: "#FFFFFF",
      text: "#2C3E50",
      textSecondary: "#7F8C8D",
    },
    style: {
      borderRadius: "rounded-2xl",
      fontFamily: "font-sans",
      cardStyle:
        "shadow-xl border-2 border-transparent bg-gradient-to-br from-white to-gray-50",
      headerStyle:
        "text-center bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-t-2xl p-4 -m-6 mb-4",
    },
  },
  {
    id: "rustico",
    name: "Rústico",
    description: "Cálido y tradicional",
    preview: "🏕️",
    colors: {
      primary: "#8B4513",
      secondary: "#D2691E",
      accent: "#CD853F",
      background: "#FDF5E6",
      card: "#FFFAF0",
      text: "#654321",
      textSecondary: "#8B7355",
    },
    style: {
      borderRadius: "rounded-lg",
      fontFamily: "font-serif",
      cardStyle:
        "shadow-md border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50",
      headerStyle: "text-center border-b-2 border-amber-300 pb-2",
    },
  },
  {
    id: "premium",
    name: "Premium",
    description: "Lujo y exclusividad",
    preview: "👑",
    colors: {
      primary: "#000000",
      secondary: "#FFD700",
      accent: "#C0C0C0",
      background: "#0A0A0A",
      card: "#1A1A1A",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
    },
    style: {
      borderRadius: "rounded-xl",
      fontFamily: "font-serif",
      cardStyle:
        "shadow-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black",
      headerStyle: "text-center border-b border-gray-700 pb-4",
    },
  },
];

export default function CrearMenuPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantDescription, setRestaurantDescription] = useState("");
  const [restaurantPhone, setRestaurantPhone] = useState("");
  const [restaurantAddress, setRestaurantAddress] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<MenuTheme>(menuThemes[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: "entradas", name: "Entradas", icon: "🍕", items: [] },
    { id: "principales", name: "Principales", icon: "🥘", items: [] },
    { id: "postres", name: "Postres", icon: "🍰", items: [] },
    { id: "bebidas", name: "Bebidas", icon: "🥤", items: [] },
  ]);

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "entradas",
    featured: false,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary-100 mx-auto mb-4" />
          <p className="text-brand-text-100">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  // Platos de ejemplo para arrastrar
  const exampleItems: MenuItem[] = [
    {
      id: "ex1",
      name: "Pizza Margherita",
      description: "Tomate, mozzarella, albahaca fresca",
      price: 2500,
      category: "entradas",
      featured: false,
    },
    {
      id: "ex2",
      name: "Empanadas Criollas",
      description: "Carne cortada a cuchillo, cebolla, huevo",
      price: 800,
      category: "entradas",
      featured: false,
    },
    {
      id: "ex3",
      name: "Milanesa Napolitana",
      description: "Con papas fritas caseras",
      price: 3200,
      category: "principales",
      featured: true,
    },
    {
      id: "ex4",
      name: "Bife de Chorizo",
      description: "Con ensalada mixta",
      price: 4500,
      category: "principales",
      featured: false,
    },
    {
      id: "ex5",
      name: "Tiramisu Casero",
      description: "Receta tradicional italiana",
      price: 1800,
      category: "postres",
      featured: false,
    },
    {
      id: "ex6",
      name: "Agua Mineral",
      description: "500ml",
      price: 500,
      category: "bebidas",
      featured: false,
    },
    {
      id: "ex7",
      name: "Coca Cola",
      description: "500ml",
      price: 800,
      category: "bebidas",
      featured: false,
    },
    {
      id: "ex8",
      name: "Flan Casero",
      description: "Con dulce de leche",
      price: 1200,
      category: "postres",
      featured: false,
    },
  ];

  const handleDragStart = (item: MenuItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newItem: MenuItem = {
      ...draggedItem,
      id: `${categoryId}-${Date.now()}`,
      category: categoryId,
    };

    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, items: [...category.items, newItem] }
          : category
      )
    );
    setDraggedItem(null);
  };

  const handleAddCustomItem = () => {
    if (
      newItem.name &&
      newItem.description &&
      newItem.price &&
      newItem.category
    ) {
      const item: MenuItem = {
        id: `custom-${Date.now()}`,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        category: newItem.category,
        featured: newItem.featured || false,
      };

      setCategories((prev) =>
        prev.map((category) =>
          category.id === item.category
            ? { ...category, items: [...category.items, item] }
            : category
        )
      );

      setNewItem({
        name: "",
        description: "",
        price: 0,
        category: "entradas",
        featured: false,
      });
      setIsAddingItem(false);
    }
  };

  const handleRemoveItem = (categoryId: string, itemId: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter((item) => item.id !== itemId),
            }
          : category
      )
    );
  };

  const handleEditItem = () => {
    if (editingItem) {
      setCategories((prev) =>
        prev.map((category) => ({
          ...category,
          items: category.items.map((item) =>
            item.id === editingItem.id ? editingItem : item
          ),
        }))
      );
      setEditingItem(null);
    }
  };

  const handleSaveMenu = async () => {
    if (!session?.access_token) {
      setSaveError("No hay sesión activa");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      const menuData = {
        restaurant: {
          name: restaurantName,
          description: restaurantDescription,
          phone: restaurantPhone,
          address: restaurantAddress,
          theme: selectedTheme.id,
        },
        categories: categories.filter((cat) => cat.items.length > 0), // Solo categorías con items
      };

      const response = await fetch("/api/restaurants/create-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(menuData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al guardar el menú");
      }

      // Redirigir al admin con el slug del restaurante
      router.push(`/admin?restaurant=${result.restaurant.slug}&success=true`);
    } catch (error) {
      console.error("Error saving menu:", error);
      setSaveError(
        error instanceof Error ? error.message : "Error al guardar el menú"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const totalItems = categories.reduce(
    (acc, category) => acc + category.items.length,
    0
  );

  const steps = [
    {
      number: 1,
      title: "Información del Restaurante",
      description: "Nombre y datos básicos",
    },
    {
      number: 2,
      title: "Crear tu Menú",
      description: "Agrega y organiza tus platos",
    },
    {
      number: 3,
      title: "Elegir Tema",
      description: "Selecciona el estilo visual",
    },
    {
      number: 4,
      title: "Personalización",
      description: "Ajusta el diseño y configuración",
    },
    { number: 5, title: "Publicar", description: "Tu menú estará listo" },
  ];

  const renderMenuPreview = (theme: MenuTheme, isFullPreview = false) => {
    const sampleCategories = categories
      .filter((cat) => cat.items.length > 0)
      .slice(0, isFullPreview ? 4 : 2);

    return (
      <div
        className={`${theme.style.fontFamily} p-4 ${theme.style.borderRadius} transition-all duration-300`}
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          minHeight: isFullPreview ? "auto" : "300px",
        }}
      >
        <div className={`${theme.style.headerStyle} mb-6`}>
          <h2
            className={`text-xl font-bold ${
              theme.id === "colorido" ? "text-white" : ""
            }`}
            style={{
              color: theme.id === "colorido" ? "white" : theme.colors.text,
            }}
          >
            {restaurantName || "Tu Restaurante"}
          </h2>
          <p
            className={`text-sm mt-1 ${
              theme.id === "colorido" ? "text-white/90" : ""
            }`}
            style={{
              color:
                theme.id === "colorido"
                  ? "rgba(255,255,255,0.9)"
                  : theme.colors.textSecondary,
            }}
          >
            menudata.com/{restaurantName.toLowerCase().replace(/\s+/g, "-")}
          </p>
        </div>

        {sampleCategories.map((category) => (
          <div key={category.id} className="mb-6">
            <h3
              className="text-lg font-bold mb-3 flex items-center"
              style={{ color: theme.colors.primary }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </h3>
            <div className="space-y-3">
              {category.items
                .slice(0, isFullPreview ? category.items.length : 2)
                .map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 ${theme.style.cardStyle} ${theme.style.borderRadius} transition-all duration-200 hover:shadow-lg`}
                    style={{ backgroundColor: theme.colors.card }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4
                        className="font-medium"
                        style={{ color: theme.colors.text }}
                      >
                        {item.name}
                      </h4>
                      {item.featured && (
                        <Star
                          className="h-4 w-4 fill-current"
                          style={{ color: theme.colors.accent }}
                        />
                      )}
                    </div>
                    <p
                      className="text-sm mb-2"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p
                        className="font-bold text-lg"
                        style={{ color: theme.colors.primary }}
                      >
                        ${item.price}
                      </p>
                      {item.featured && (
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: theme.colors.accent,
                            color:
                              theme.id === "premium"
                                ? theme.colors.text
                                : "#000000",
                          }}
                        >
                          Destacado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {sampleCategories.length === 0 && (
          <div
            className="text-center py-8"
            style={{ color: theme.colors.textSecondary }}
          >
            <p>Agrega platos para ver la vista previa</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg-100">
      {/* Header */}
      <header className="bg-white dark:bg-brand-text-100 shadow-sm border-b border-brand-bg-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-brand-text-100 hover:text-brand-primary-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver al inicio</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
                  <Smartphone className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 bg-clip-text text-transparent">
                  Constructor de Menú
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
              {currentStep === 5 && (
                <Button
                  onClick={handleSaveMenu}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 hover:from-brand-accent-200 hover:to-brand-accent-100 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar Menú
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <section className="bg-white dark:bg-brand-text-100/10 border-b border-brand-bg-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      currentStep >= step.number
                        ? "bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 text-white"
                        : "bg-brand-bg-200 text-brand-text-200"
                    }`}
                  >
                    {step.number}
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-sm font-medium text-brand-text-200">
                      {step.title}
                    </p>
                    <p className="text-xs text-brand-text-100">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-20 h-0.5 mx-4 ${
                      currentStep > step.number
                        ? "bg-brand-primary-100"
                        : "bg-brand-bg-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {saveError && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">
              {saveError}
            </AlertDescription>
          </Alert>
        )}

        {currentStep === 1 && (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300">
              <CardHeader>
                <CardTitle className="text-2xl text-brand-text-200">
                  Información del Restaurante
                </CardTitle>
                <p className="text-brand-text-100">
                  Empecemos con los datos básicos de tu restaurante
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label
                    htmlFor="restaurant-name"
                    className="text-brand-text-200 font-medium"
                  >
                    Nombre del Restaurante *
                  </Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Ej: La Pizzería de Mario"
                    className="mt-2"
                  />
                  <p className="text-sm text-brand-text-100 mt-1">
                    Tu menú estará disponible en: menudata.com/
                    {restaurantName.toLowerCase().replace(/\s+/g, "-")}
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="restaurant-description"
                    className="text-brand-text-200 font-medium"
                  >
                    Descripción (opcional)
                  </Label>
                  <Textarea
                    id="restaurant-description"
                    value={restaurantDescription}
                    onChange={(e) => setRestaurantDescription(e.target.value)}
                    placeholder="Describe tu restaurante..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="restaurant-phone"
                      className="text-brand-text-200 font-medium"
                    >
                      Teléfono (opcional)
                    </Label>
                    <Input
                      id="restaurant-phone"
                      value={restaurantPhone}
                      onChange={(e) => setRestaurantPhone(e.target.value)}
                      placeholder="+54 9 11 1234-5678"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="restaurant-address"
                      className="text-brand-text-200 font-medium"
                    >
                      Dirección (opcional)
                    </Label>
                    <Input
                      id="restaurant-address"
                      value={restaurantAddress}
                      onChange={(e) => setRestaurantAddress(e.target.value)}
                      placeholder="Av. Corrientes 1234"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    disabled={!restaurantName.trim()}
                    className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Platos de Ejemplo */}
            <div className="lg:col-span-1">
              <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg text-brand-text-200 flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Platos Disponibles
                  </CardTitle>
                  <p className="text-sm text-brand-text-100">
                    Arrastra los platos a tu menú o crea uno personalizado
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {exampleItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item)}
                        className="bg-brand-bg-100 border-brand-bg-300 p-3 rounded-lg border cursor-move hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <GripVertical className="h-4 w-4 text-brand-text-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex-1">
                            <h4 className="font-medium text-brand-text-200 text-sm">
                              {item.name}
                            </h4>
                            <p className="text-xs text-brand-text-100 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand-primary-100">
                            ${item.price}
                          </span>
                          {item.featured && (
                            <Badge className="bg-brand-accent-100 text-brand-text-200 text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Destacado
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setIsAddingItem(true)}
                    variant="outline"
                    className="w-full border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Plato Personalizado
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Constructor del Menú */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-brand-text-200 mb-2">
                  Menú de {restaurantName || "Tu Restaurante"}
                </h2>
                <p className="text-brand-text-100">
                  Arrastra platos desde la columna izquierda a las categorías
                  correspondientes
                </p>
                <div className="mt-4 flex items-center space-x-4">
                  <Badge className="bg-brand-accent-100 text-brand-text-200">
                    {totalItems} platos agregados
                  </Badge>
                  <Badge className="bg-brand-primary-200 text-white">
                    {categories.filter((cat) => cat.items.length > 0).length}{" "}
                    categorías activas
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <Card
                    key={category.id}
                    className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300 min-h-[300px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, category.id)}
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-brand-text-200 flex items-center">
                        <span className="text-xl mr-2">{category.icon}</span>
                        {category.name}
                        <Badge className="ml-2 bg-brand-bg-200 text-brand-text-200">
                          {category.items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-brand-bg-100 p-3 rounded-lg border border-brand-bg-300 group hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-brand-text-200 text-sm">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-brand-text-100 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingItem(item)}
                                  className="h-6 w-6 p-0 hover:bg-brand-primary-100/20"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleRemoveItem(category.id, item.id)
                                  }
                                  className="h-6 w-6 p-0 hover:bg-brand-primary-200/20 text-brand-primary-200"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-brand-primary-100">
                                ${item.price}
                              </span>
                              {item.featured && (
                                <Badge className="bg-brand-accent-100 text-brand-text-200 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Destacado
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {category.items.length === 0 && (
                          <div className="text-center py-8 text-brand-text-100 border-2 border-dashed border-brand-bg-300 rounded-lg">
                            <p className="text-sm">Arrastra platos aquí</p>
                            <p className="text-xs mt-1">
                              o crea uno personalizado
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="border-brand-text-100 text-brand-text-100"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={totalItems === 0}
                  className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-brand-text-200 mb-2 flex items-center justify-center">
                <Palette className="h-8 w-8 mr-3 text-brand-primary-100" />
                Elige el Tema de tu Menú
              </h2>
              <p className="text-brand-text-100">
                Selecciona el estilo visual que mejor represente tu restaurante
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {menuThemes.map((theme) => (
                <Card
                  key={theme.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    selectedTheme.id === theme.id
                      ? "ring-2 ring-brand-primary-100 shadow-xl scale-105"
                      : "hover:scale-102"
                  }`}
                  onClick={() => setSelectedTheme(theme)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{theme.preview}</span>
                        <div>
                          <CardTitle className="text-lg text-brand-text-200">
                            {theme.name}
                          </CardTitle>
                          <p className="text-sm text-brand-text-100">
                            {theme.description}
                          </p>
                        </div>
                      </div>
                      {selectedTheme.id === theme.id && (
                        <div className="w-6 h-6 bg-brand-primary-100 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      {renderMenuPreview(theme)}
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.secondary }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.accent }}
                      ></div>
                      <span className="text-xs text-brand-text-100 ml-2">
                        Paleta de colores
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="border-brand-text-100 text-brand-text-100"
              >
                Anterior
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
              >
                Continuar con {selectedTheme.name}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300">
              <CardHeader>
                <CardTitle className="text-2xl text-brand-text-200">
                  Personalización Final
                </CardTitle>
                <p className="text-brand-text-100">
                  Revisa y ajusta los detalles finales de tu menú
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-brand-text-200 mb-4">
                      Configuración
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-brand-text-200">
                          Tema seleccionado
                        </Label>
                        <div className="flex items-center space-x-3 mt-2 p-3 bg-brand-bg-100 rounded-lg">
                          <span className="text-xl">
                            {selectedTheme.preview}
                          </span>
                          <div>
                            <p className="font-medium text-brand-text-200">
                              {selectedTheme.name}
                            </p>
                            <p className="text-sm text-brand-text-100">
                              {selectedTheme.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-brand-text-200">
                          Estadísticas del menú
                        </Label>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="bg-brand-bg-100 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-brand-primary-100">
                              {totalItems}
                            </p>
                            <p className="text-sm text-brand-text-100">
                              Platos totales
                            </p>
                          </div>
                          <div className="bg-brand-bg-100 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-brand-accent-200">
                              {
                                categories.filter((cat) => cat.items.length > 0)
                                  .length
                              }
                            </p>
                            <p className="text-sm text-brand-text-100">
                              Categorías
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-text-200 mb-4">
                      Vista Previa Final
                    </h3>
                    <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                      {renderMenuPreview(selectedTheme, true)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    className="border-brand-text-100 text-brand-text-100"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
                  >
                    Continuar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 5 && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300">
              <CardHeader>
                <CardTitle className="text-2xl text-brand-text-200">
                  ¡Menú Listo para Publicar! 🎉
                </CardTitle>
                <p className="text-brand-text-100">
                  Tu menú digital está configurado. Haz clic en "Finalizar" para
                  guardarlo en la base de datos.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-brand-bg-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <QrCode className="h-8 w-8 text-brand-primary-100" />
                      <div>
                        <h3 className="font-bold text-brand-text-200">
                          Tu QR personalizado
                        </h3>
                        <p className="text-sm text-brand-text-100">
                          Se generará automáticamente
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-brand-bg-300">
                      <p className="text-sm text-brand-primary-100 font-mono">
                        menudata.com/
                        {restaurantName.toLowerCase().replace(/\s+/g, "-")}
                      </p>
                    </div>
                  </div>
                  <div className="bg-brand-bg-100 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <Smartphone className="h-8 w-8 text-brand-accent-200" />
                      <div>
                        <h3 className="font-bold text-brand-text-200">
                          Panel de administración
                        </h3>
                        <p className="text-sm text-brand-text-100">
                          Gestiona tu menú después
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-brand-bg-300">
                      <p className="text-sm text-brand-text-100">
                        Podrás editar platos, precios y configuración desde el
                        admin
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-brand-accent-100/20 to-brand-accent-200/20 p-6 rounded-xl border border-brand-accent-100/30">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl">{selectedTheme.preview}</span>
                    <div>
                      <h3 className="font-bold text-brand-text-200">
                        Resumen: {restaurantName}
                      </h3>
                      <p className="text-sm text-brand-text-100">
                        Tema: {selectedTheme.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-brand-primary-100">
                        {totalItems}
                      </p>
                      <p className="text-xs text-brand-text-100">Platos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-brand-accent-200">
                        {
                          categories.filter((cat) => cat.items.length > 0)
                            .length
                        }
                      </p>
                      <p className="text-xs text-brand-text-100">Categorías</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-brand-primary-200">
                        {categories.reduce(
                          (acc, cat) =>
                            acc +
                            cat.items.filter((item) => item.featured).length,
                          0
                        )}
                      </p>
                      <p className="text-xs text-brand-text-100">Destacados</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-brand-accent-100">
                        ✓
                      </p>
                      <p className="text-xs text-brand-text-100">Listo</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(4)}
                    disabled={isSaving}
                    className="border-brand-text-100 text-brand-text-100"
                  >
                    Anterior
                  </Button>
                  <Button
                    onClick={handleSaveMenu}
                    disabled={isSaving}
                    size="lg"
                    className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white px-8"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando en base de datos...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Finalizar y Crear Menú
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Add Custom Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-text-100">
              Crear Plato Personalizado
            </DialogTitle>
            <DialogDescription className="text-brand-text-100">
              Agrega un plato único de tu restaurante
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-brand-text-200">
                Nombre del plato
              </Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="Ej: Especialidad de la casa"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-brand-text-200">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                placeholder="Describe los ingredientes y preparación"
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-brand-text-200">
                  Precio
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: Number(e.target.value) })
                  }
                  placeholder="2500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-brand-text-200">
                  Categoría
                </Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, category: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newItem.featured}
                onCheckedChange={(checked) =>
                  setNewItem({ ...newItem, featured: checked })
                }
              />
              <Label className="text-brand-text-200">
                Marcar como destacado
              </Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingItem(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddCustomItem}
              className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
            >
              Agregar Plato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-text-100">
              Editar Plato
            </DialogTitle>
            <DialogDescription className="text-brand-text-100">
              Modifica la información del plato
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-brand-text-200">
                  Nombre del plato
                </Label>
                <Input
                  id="edit-name"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-description"
                  className="text-brand-text-200"
                >
                  Descripción
                </Label>
                <Textarea
                  id="edit-description"
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-price" className="text-brand-text-200">
                  Precio
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editingItem.price}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      price: Number(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingItem.featured}
                  onCheckedChange={(checked) =>
                    setEditingItem({ ...editingItem, featured: checked })
                  }
                />
                <Label className="text-brand-text-200">
                  Marcar como destacado
                </Label>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEditItem}
              className="bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 hover:from-brand-accent-200 hover:to-brand-accent-100 text-white"
            >
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-brand-text-200 flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Vista Previa del Menú - {selectedTheme.name}
            </DialogTitle>
            <DialogDescription className="text-brand-text-100">
              Así verán tu menú los clientes en sus celulares
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg overflow-hidden">
            {renderMenuPreview(selectedTheme, true)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
