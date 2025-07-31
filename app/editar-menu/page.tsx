"use client";

import type React from "react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Download,
  Edit,
  Eye,
  GripVertical,
  Loader2,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Share2,
  Smartphone,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_featured: boolean;
  is_available: boolean;
  image_url?: string;
  views?: number;
  rating?: number;
  ingredients?: string[];
  allergens?: string[];
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  menu_items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  hours: string | null;
  website: string | null;
  theme:
    | "clasico"
    | "moderno"
    | "elegante"
    | "colorido"
    | "rustico"
    | "premium";
  logo_url: string | null;
  features: {
    wifi: boolean;
    parking: boolean;
    delivery: boolean;
    takeaway: boolean;
  } | null;
  menu_categories: MenuCategory[];
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
      primary: "#6366F1",
      secondary: "#8B5CF6",
      accent: "#F59E0B",
      background: "#F8FAFC",
      card: "#FFFFFF",
      text: "#1E293B",
      textSecondary: "#64748B",
    },
    style: {
      borderRadius: "rounded-2xl",
      fontFamily: "font-sans",
      cardStyle: "shadow-lg border-0",
      headerStyle: "text-left",
    },
  },
  {
    id: "elegante",
    name: "Elegante",
    description: "Sofisticado y premium",
    preview: "💎",
    colors: {
      primary: "#1F2937",
      secondary: "#374151",
      accent: "#D97706",
      background: "#F9FAFB",
      card: "#FFFFFF",
      text: "#111827",
      textSecondary: "#6B7280",
    },
    style: {
      borderRadius: "rounded-lg",
      fontFamily: "font-serif",
      cardStyle: "shadow-sm border",
      headerStyle: "text-center",
    },
  },
  {
    id: "colorido",
    name: "Colorido",
    description: "Vibrante y divertido",
    preview: "🌈",
    colors: {
      primary: "#EC4899",
      secondary: "#F472B6",
      accent: "#10B981",
      background: "#FEF7FF",
      card: "#FFFFFF",
      text: "#1F2937",
      textSecondary: "#6B7280",
    },
    style: {
      borderRadius: "rounded-3xl",
      fontFamily: "font-sans",
      cardStyle: "shadow-xl border-2",
      headerStyle: "text-center",
    },
  },
  {
    id: "rustico",
    name: "Rústico",
    description: "Cálido y tradicional",
    preview: "🏕️",
    colors: {
      primary: "#92400E",
      secondary: "#B45309",
      accent: "#059669",
      background: "#FFFBEB",
      card: "#FFFFFF",
      text: "#1C1917",
      textSecondary: "#78716C",
    },
    style: {
      borderRadius: "rounded-lg",
      fontFamily: "font-serif",
      cardStyle: "shadow-md border-2",
      headerStyle: "text-left",
    },
  },
  {
    id: "premium",
    name: "Premium",
    description: "Lujo y exclusividad",
    preview: "👑",
    colors: {
      primary: "#7C3AED",
      secondary: "#8B5CF6",
      accent: "#F59E0B",
      background: "#FAFAFA",
      card: "#FFFFFF",
      text: "#18181B",
      textSecondary: "#71717A",
    },
    style: {
      borderRadius: "rounded-2xl",
      fontFamily: "font-sans",
      cardStyle: "shadow-2xl border-0",
      headerStyle: "text-center",
    },
  },
];

export default function EditarMenuPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("id");

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<MenuTheme>(menuThemes[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeTab, setActiveTab] = useState("menu");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    is_featured: false,
    is_available: true,
  });

  // Cargar datos del restaurante
  useEffect(() => {
    const loadRestaurant = async () => {
      if (!restaurantId || !session?.accessToken) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/restaurants/${restaurantId}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al cargar el restaurante");
        }

        const data = await response.json();
        setRestaurant(data.restaurant);

        // Establecer el tema actual
        const currentTheme =
          menuThemes.find((t) => t.id === data.restaurant.theme) ||
          menuThemes[0];
        setSelectedTheme(currentTheme);
      } catch (error) {
        console.error("Error loading restaurant:", error);
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId, session, router]);

  // Marcar cambios no guardados
  useEffect(() => {
    if (restaurant) {
      setHasUnsavedChanges(true);
    }
  }, [restaurant, selectedTheme]);

  const handleDragStart = (item: MenuItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    if (!draggedItem || !session?.accessToken) return;

    try {
      // Actualizar en la base de datos
      const response = await fetch(
        `/api/restaurants/${restaurant?.id}/categories/${draggedItem.category_id}/items/${draggedItem.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            category_id: targetCategoryId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al mover el item");
      }

      // Actualizar el estado local
      setRestaurant((prev) => {
        if (!prev) return prev;

        const updatedCategories = prev.menu_categories.map((category) => {
          if (category.id === draggedItem.category_id) {
            return {
              ...category,
              menu_items: category.menu_items.filter(
                (item) => item.id !== draggedItem.id
              ),
            };
          }
          if (category.id === targetCategoryId) {
            return {
              ...category,
              menu_items: [
                ...category.menu_items,
                { ...draggedItem, category_id: targetCategoryId },
              ],
            };
          }
          return category;
        });

        return { ...prev, menu_categories: updatedCategories };
      });
    } catch (error) {
      console.error("Error moving item:", error);
    }

    setDraggedItem(null);
  };

  const handleSaveItem = async () => {
    if (!editingItem || !session?.accessToken) return;

    try {
      const response = await fetch(
        `/api/restaurants/${restaurant?.id}/categories/${editingItem.category_id}/items/${editingItem.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            name: editingItem.name,
            description: editingItem.description,
            price: editingItem.price,
            is_featured: editingItem.is_featured,
            is_available: editingItem.is_available,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el item");
      }

      // Actualizar el estado local
      setRestaurant((prev) => {
        if (!prev) return prev;

        const updatedCategories = prev.menu_categories.map((category) => ({
          ...category,
          menu_items: category.menu_items.map((item) =>
            item.id === editingItem.id ? editingItem : item
          ),
        }));

        return { ...prev, menu_categories: updatedCategories };
      });

      setEditingItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  const handleAddItem = async () => {
    if (
      !newItem.name ||
      !newItem.description ||
      !newItem.price ||
      !newItem.category_id ||
      !session?.accessToken
    )
      return;

    try {
      const response = await fetch(
        `/api/restaurants/${restaurant?.id}/categories/${newItem.category_id}/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            name: newItem.name,
            description: newItem.description,
            price: newItem.price,
            is_featured: newItem.is_featured || false,
            is_available: newItem.is_available !== false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al crear el item");
      }

      const data = await response.json();
      const createdItem = data.item;

      // Actualizar el estado local
      setRestaurant((prev) => {
        if (!prev) return prev;

        const updatedCategories = prev.menu_categories.map((category) =>
          category.id === newItem.category_id
            ? { ...category, menu_items: [...category.menu_items, createdItem] }
            : category
        );

        return { ...prev, menu_categories: updatedCategories };
      });

      setNewItem({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        is_featured: false,
        is_available: true,
      });
      setIsAddingItem(false);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string, categoryId: string) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(
        `/api/restaurants/${restaurant?.id}/categories/${categoryId}/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el item");
      }

      // Actualizar el estado local
      setRestaurant((prev) => {
        if (!prev) return prev;

        const updatedCategories = prev.menu_categories.map((category) => ({
          ...category,
          menu_items: category.menu_items.filter((item) => item.id !== itemId),
        }));

        return { ...prev, menu_categories: updatedCategories };
      });
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSaveMenu = async () => {
    if (!restaurant || !session?.accessToken) return;

    try {
      setSaving(true);

      // Actualizar información del restaurante
      const response = await fetch(`/api/restaurants/${restaurant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          name: restaurant.name,
          description: restaurant.description,
          phone: restaurant.phone,
          address: restaurant.address,
          hours: restaurant.hours,
          website: restaurant.website,
          theme: selectedTheme.id,
          features: restaurant.features,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el menú");
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Error saving menu:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderMenuPreview = (theme: MenuTheme, isFullPreview = false) => {
    if (!restaurant) return null;

    const sampleCategories = restaurant.menu_categories
      .filter((cat) => cat.menu_items.length > 0)
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
            {restaurant.name}
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
            menudata.com/{restaurant.slug}
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
              {category.menu_items
                .filter((item) => item.is_available)
                .slice(0, isFullPreview ? category.menu_items.length : 2)
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
                      {item.is_featured && (
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
                      {item.is_featured && (
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-brand-primary-100 mx-auto mb-4" />
          <p className="text-brand-text-100">Cargando editor...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-brand-text-200 mb-2">
              Restaurante no encontrado
            </h2>
            <p className="text-brand-text-100 mb-4">
              No se pudo cargar la información del restaurante.
            </p>
            <Button
              onClick={() => router.push("/admin")}
              className="bg-brand-primary-100 hover:bg-brand-primary-200 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalItems = restaurant.menu_categories.reduce(
    (acc, category) => acc + category.menu_items.length,
    0
  );
  const totalViews = restaurant.menu_categories.reduce(
    (acc, category) =>
      acc +
      category.menu_items.reduce(
        (itemAcc, item) => itemAcc + (item.views || 0),
        0
      ),
    0
  );
  const featuredItems = restaurant.menu_categories.reduce(
    (acc, category) =>
      acc + category.menu_items.filter((item) => item.is_featured).length,
    0
  );

  return (
    <div className="min-h-screen bg-brand-bg-100">
      {/* Header */}
      <header className="bg-white dark:bg-brand-text-100 shadow-sm border-b border-brand-bg-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center space-x-2 text-brand-text-100 hover:text-brand-primary-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Volver al admin</span>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
                  <Edit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 bg-clip-text text-transparent">
                    Editor de Menú
                  </span>
                  <p className="text-xs text-brand-text-100">
                    Última actualización: {lastSaved.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {hasUnsavedChanges && (
                <Badge className="bg-brand-accent-100 text-brand-text-200">
                  Cambios sin guardar
                </Badge>
              )}
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
              <Button
                onClick={handleSaveMenu}
                disabled={saving}
                className="bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 hover:from-brand-accent-200 hover:to-brand-accent-100 text-white"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="bg-white dark:bg-brand-text-100/10 border-b border-brand-bg-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-primary-100">
                  {totalItems}
                </p>
                <p className="text-xs text-brand-text-100">Platos totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-accent-200">
                  {featuredItems}
                </p>
                <p className="text-xs text-brand-text-100">Destacados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-primary-200">
                  {totalViews}
                </p>
                <p className="text-xs text-brand-text-100">Vistas totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-brand-text-200">
                  {restaurant.menu_categories.length}
                </p>
                <p className="text-xs text-brand-text-100">Categorías</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar QR
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="menu" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Menú</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Tema</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configuración</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Estadísticas</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Menú */}
          <TabsContent value="menu" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-brand-text-200">
                  Gestión del Menú
                </h2>
                <p className="text-brand-text-100">
                  Edita, agrega o elimina platos de tu menú
                </p>
              </div>
              <Button
                onClick={() => setIsAddingItem(true)}
                className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Plato
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              {restaurant.menu_categories.map((category) => (
                <Card
                  key={category.id}
                  className="bg-white dark:bg-brand-primary-300/10 border-brand-bg-300"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.id)}
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg text-brand-text-200 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                      <Badge className="bg-brand-bg-200 text-brand-text-200">
                        {category.menu_items.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 min-h-[200px]">
                      {category.menu_items.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={() => handleDragStart(item)}
                          className="bg-brand-bg-100 dark:bg-brand-primary-300/20 rounded-xl p-4 border border-brand-bg-300 cursor-move hover:shadow-md transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2 flex-1">
                              <GripVertical className="h-4 w-4 text-brand-text-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-brand-text-200 text-sm">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-brand-text-100 mt-1 line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingItem(item)}
                                className="h-8 w-8 p-0 hover:bg-brand-primary-100/20"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleDeleteItem(item.id, item.category_id)
                                }
                                className="h-8 w-8 p-0 hover:bg-brand-primary-200/20 text-brand-primary-200"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-brand-primary-100">
                                ${item.price}
                              </span>
                              {item.is_featured && (
                                <Badge className="bg-brand-accent-100 text-brand-text-200 text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Destacado
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-brand-text-100">
                              {item.views && (
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{item.views}</span>
                                </div>
                              )}
                              {item.rating && item.rating > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-current text-brand-primary-200" />
                                  <span>{item.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={item.is_available}
                                onCheckedChange={async (checked) => {
                                  if (!session?.accessToken) return;

                                  try {
                                    const response = await fetch(
                                      `/api/restaurants/${restaurant.id}/categories/${item.category_id}/items/${item.id}`,
                                      {
                                        method: "PATCH",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${session.accessToken}`,
                                        },
                                        body: JSON.stringify({
                                          is_available: checked,
                                        }),
                                      }
                                    );

                                    if (response.ok) {
                                      setRestaurant((prev) => {
                                        if (!prev) return prev;

                                        const updatedCategories =
                                          prev.menu_categories.map((cat) => ({
                                            ...cat,
                                            menu_items: cat.menu_items.map(
                                              (i) =>
                                                i.id === item.id
                                                  ? {
                                                      ...i,
                                                      is_available: checked,
                                                    }
                                                  : i
                                            ),
                                          }));

                                        return {
                                          ...prev,
                                          menu_categories: updatedCategories,
                                        };
                                      });
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error updating availability:",
                                      error
                                    );
                                  }
                                }}
                                className="scale-75"
                              />
                              <Label className="text-xs text-brand-text-100">
                                {item.is_available
                                  ? "Disponible"
                                  : "No disponible"}
                              </Label>
                            </div>
                          </div>
                        </div>
                      ))}

                      {category.menu_items.length === 0 && (
                        <div className="text-center py-8 text-brand-text-100">
                          <p className="text-sm">
                            No hay platos en esta categoría
                          </p>
                          <p className="text-xs mt-1">
                            Agrega platos para comenzar
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Tema */}
          <TabsContent value="theme" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-text-200 mb-2">
                Personalizar Tema
              </h2>
              <p className="text-brand-text-100">
                Cambia la apariencia visual de tu menú
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                          <Star className="h-4 w-4 text-white fill-current" />
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
          </TabsContent>

          {/* Tab: Configuración */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-text-200 mb-2">
                Configuración del Restaurante
              </h2>
              <p className="text-brand-text-100">
                Actualiza la información básica de tu restaurante
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300">
                <CardHeader>
                  <CardTitle className="text-brand-text-200">
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label
                      htmlFor="restaurant-name"
                      className="text-brand-text-200"
                    >
                      Nombre del Restaurante
                    </Label>
                    <Input
                      id="restaurant-name"
                      value={restaurant.name}
                      onChange={(e) =>
                        setRestaurant((prev) =>
                          prev ? { ...prev, name: e.target.value } : null
                        )
                      }
                      className="mt-1"
                    />
                    <p className="text-sm text-brand-text-100 mt-1">
                      URL: menudata.com/{restaurant.slug}
                    </p>
                  </div>
                  <div>
                    <Label
                      htmlFor="description"
                      className="text-brand-text-200"
                    >
                      Descripción (opcional)
                    </Label>
                    <Textarea
                      id="description"
                      value={restaurant.description || ""}
                      onChange={(e) =>
                        setRestaurant((prev) =>
                          prev ? { ...prev, description: e.target.value } : null
                        )
                      }
                      placeholder="Describe tu restaurante..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-brand-text-200">
                      Teléfono de contacto
                    </Label>
                    <Input
                      id="phone"
                      value={restaurant.phone || ""}
                      onChange={(e) =>
                        setRestaurant((prev) =>
                          prev ? { ...prev, phone: e.target.value } : null
                        )
                      }
                      placeholder="+54 9 11 1234-5678"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-brand-text-200">
                      Dirección
                    </Label>
                    <Input
                      id="address"
                      value={restaurant.address || ""}
                      onChange={(e) =>
                        setRestaurant((prev) =>
                          prev ? { ...prev, address: e.target.value } : null
                        )
                      }
                      placeholder="Av. Corrientes 1234, CABA"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours" className="text-brand-text-200">
                      Horarios
                    </Label>
                    <Input
                      id="hours"
                      value={restaurant.hours || ""}
                      onChange={(e) =>
                        setRestaurant((prev) =>
                          prev ? { ...prev, hours: e.target.value } : null
                        )
                      }
                      placeholder="Lun-Dom 12:00-23:00"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-brand-text-200">
                      Sitio web
                    </Label>
                    <Input
                      id="website"
                      value={restaurant.website || ""}
                      onChange={(e) =>
                        setRestaurant((prev) =>
                          prev ? { ...prev, website: e.target.value } : null
                        )
                      }
                      placeholder="www.mirestaurante.com"
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300">
                <CardHeader>
                  <CardTitle className="text-brand-text-200">
                    Vista Previa Actual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                    {renderMenuPreview(selectedTheme, true)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Estadísticas */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-brand-text-200 mb-2">
                Estadísticas del Menú
              </h2>
              <p className="text-brand-text-100">
                Analiza el rendimiento de tus platos
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-brand-primary-100/20 to-brand-primary-200/20 border-brand-primary-100/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-brand-text-100">
                    Total de Platos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-brand-primary-100">
                    {totalItems}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-brand-accent-100/20 to-brand-accent-200/20 border-brand-accent-100/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-brand-text-100">
                    Platos Destacados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-brand-accent-200">
                    {featuredItems}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-brand-primary-200/20 to-brand-primary-100/20 border-brand-primary-200/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-brand-text-100">
                    Total de Vistas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-brand-primary-200">
                    {totalViews}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-brand-bg-200/50 to-brand-bg-300/50 border-brand-bg-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-brand-text-100">
                    Categorías Activas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-brand-text-200">
                    {
                      restaurant.menu_categories.filter(
                        (cat) => cat.menu_items.length > 0
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300">
              <CardHeader>
                <CardTitle className="text-brand-text-200">
                  Platos Más Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {restaurant.menu_categories
                    .flatMap((cat) => cat.menu_items)
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 5)
                    .map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-brand-bg-100 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-brand-primary-100 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-brand-text-200">
                              {item.name}
                            </h4>
                            <p className="text-sm text-brand-text-100">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-brand-primary-100">
                            {item.views || 0} vistas
                          </p>
                          {item.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-current text-brand-primary-200" />
                              <span className="text-sm text-brand-text-100">
                                {item.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-brand-text-200">
              Agregar Nuevo Plato
            </DialogTitle>
            <DialogDescription className="text-brand-text-100">
              Completa la información del nuevo plato para tu menú
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
                placeholder="Ej: Pizza Margherita"
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
                placeholder="Ej: Tomate, mozzarella, albahaca fresca"
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
                  value={newItem.category_id}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, category_id: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurant.menu_categories.map((category) => (
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
                checked={newItem.is_featured}
                onCheckedChange={(checked) =>
                  setNewItem({ ...newItem, is_featured: checked })
                }
              />
              <Label className="text-brand-text-200">
                Marcar como destacado
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={newItem.is_available}
                onCheckedChange={(checked) =>
                  setNewItem({ ...newItem, is_available: checked })
                }
              />
              <Label className="text-brand-text-200">Disponible</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddingItem(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddItem}
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
            <DialogTitle className="text-brand-text-200">
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
                  checked={editingItem.is_featured}
                  onCheckedChange={(checked) =>
                    setEditingItem({ ...editingItem, is_featured: checked })
                  }
                />
                <Label className="text-brand-text-200">
                  Marcar como destacado
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingItem.is_available}
                  onCheckedChange={(checked) =>
                    setEditingItem({ ...editingItem, is_available: checked })
                  }
                />
                <Label className="text-brand-text-200">Disponible</Label>
              </div>
              <div className="bg-brand-bg-200 p-4 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brand-text-100">Vistas:</span>
                  <span className="font-semibold text-brand-text-200">
                    {editingItem.views || 0}
                  </span>
                </div>
                {editingItem.rating && editingItem.rating > 0 && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-brand-text-100">Calificación:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-current text-brand-primary-200" />
                      <span className="font-semibold text-brand-text-200">
                        {editingItem.rating}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveItem}
              className="bg-gradient-to-r from-brand-accent-100 to-brand-accent-200 hover:from-brand-accent-200 hover:to-brand-accent-100 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
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
              Vista Previa - {selectedTheme.name}
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

      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert className="bg-brand-accent-100 border-brand-accent-200 text-white shadow-lg">
            <AlertDescription className="flex items-center space-x-2">
              <span>Tienes cambios sin guardar</span>
              <Button
                size="sm"
                onClick={handleSaveMenu}
                disabled={saving}
                className="bg-white text-brand-accent-100 hover:bg-gray-100 ml-2"
              >
                {saving ? "Guardando..." : "Guardar ahora"}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
