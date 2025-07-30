"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Car,
  Clock,
  ExternalLink,
  Filter,
  Heart,
  Loader2,
  MapPin,
  Phone,
  Search,
  Share2,
  Star,
  Wifi,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  is_featured: boolean;
  is_available: boolean;
  sort_order: number;
  views: number;
  rating: number;
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

const themes: Record<string, MenuTheme> = {
  clasico: {
    id: "clasico",
    name: "Clásico",
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
  moderno: {
    id: "moderno",
    name: "Moderno",
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
  elegante: {
    id: "elegante",
    name: "Elegante",
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
  colorido: {
    id: "colorido",
    name: "Colorido",
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
  rustico: {
    id: "rustico",
    name: "Rústico",
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
  premium: {
    id: "premium",
    name: "Premium",
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
};

export default function RestaurantMenuPage() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Cargar datos del restaurante desde la API
  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/public/restaurants/${restaurantSlug}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError("Restaurante no encontrado");
          } else {
            setError("Error al cargar el menú");
          }
          return;
        }

        const data = await response.json();
        setRestaurant(data.restaurant);
      } catch (err) {
        console.error("Error loading restaurant:", err);
        setError("Error al cargar el menú");
      } finally {
        setLoading(false);
      }
    };

    if (restaurantSlug) {
      loadRestaurantData();
    }
  }, [restaurantSlug]);

  // Cargar favoritos del localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(`favorites-${restaurantSlug}`);
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, [restaurantSlug]);

  const toggleFavorite = (itemId: string) => {
    const newFavorites = favorites.includes(itemId)
      ? favorites.filter((id) => id !== itemId)
      : [...favorites, itemId];

    setFavorites(newFavorites);
    localStorage.setItem(
      `favorites-${restaurantSlug}`,
      JSON.stringify(newFavorites)
    );
  };

  const shareItem = async (item: MenuItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.name} - ${restaurant?.name}`,
          text: `${item.description} - $${item.price}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(
        `${item.name} - ${item.description} - $${item.price} | ${window.location.href}`
      );
    }
  };

  const handleItemClick = async (item: MenuItem) => {
    setSelectedItem(item);

    // Registrar vista del item
    try {
      await fetch(
        `/api/public/restaurants/${restaurantSlug}/items/${item.id}/view`,
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error("Error tracking item view:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {error || "Restaurante no encontrado"}
            </h2>
            <p className="text-gray-600 mb-4">
              No pudimos encontrar el menú que buscas. Verifica la URL o
              contacta al restaurante.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const theme = themes[restaurant.theme] || themes.clasico;

  const filteredItems = restaurant.menu_categories.flatMap((category) =>
    category.menu_items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === "all" || category.id === selectedCategory;
      return matchesSearch && matchesCategory && item.is_available;
    })
  );

  const featuredItems = restaurant.menu_categories.flatMap((category) =>
    category.menu_items.filter((item) => item.is_featured && item.is_available)
  );

  return (
    <div
      className={`min-h-screen ${theme.style.fontFamily}`}
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {/* Header del Restaurante */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b"
        style={{
          backgroundColor: `${theme.colors.card}95`,
          borderColor: theme.colors.primary + "30",
        }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1
                className={`text-xl font-bold ${theme.style.headerStyle}`}
                style={{ color: theme.colors.text }}
              >
                {restaurant.name}
              </h1>
              <p
                className="text-sm"
                style={{ color: theme.colors.textSecondary }}
              >
                menudata.com/{restaurant.slug}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                style={{ color: theme.colors.primary }}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                style={{ color: theme.colors.primary }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Información del Restaurante */}
      <section className="container mx-auto px-4 py-6">
        <Card
          className={`${theme.style.cardStyle} ${theme.style.borderRadius} mb-6`}
          style={{ backgroundColor: theme.colors.card }}
        >
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h2
                className="text-2xl font-bold mb-2"
                style={{ color: theme.colors.text }}
              >
                {restaurant.name}
              </h2>
              {restaurant.description && (
                <p
                  className="text-sm mb-4"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {restaurant.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {restaurant.phone && (
                <div className="flex items-center space-x-2">
                  <Phone
                    className="h-4 w-4"
                    style={{ color: theme.colors.primary }}
                  />
                  <span style={{ color: theme.colors.textSecondary }}>
                    {restaurant.phone}
                  </span>
                </div>
              )}
              {restaurant.address && (
                <div className="flex items-center space-x-2">
                  <MapPin
                    className="h-4 w-4"
                    style={{ color: theme.colors.primary }}
                  />
                  <span style={{ color: theme.colors.textSecondary }}>
                    {restaurant.address}
                  </span>
                </div>
              )}
              {restaurant.hours && (
                <div className="flex items-center space-x-2">
                  <Clock
                    className="h-4 w-4"
                    style={{ color: theme.colors.primary }}
                  />
                  <span style={{ color: theme.colors.textSecondary }}>
                    {restaurant.hours}
                  </span>
                </div>
              )}
              {restaurant.website && (
                <div className="flex items-center space-x-2">
                  <ExternalLink
                    className="h-4 w-4"
                    style={{ color: theme.colors.primary }}
                  />
                  <a
                    href={`https://${restaurant.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {restaurant.website}
                  </a>
                </div>
              )}
            </div>

            {restaurant.features && (
              <div
                className="flex items-center justify-center space-x-4 mt-4 pt-4 border-t"
                style={{ borderColor: theme.colors.primary + "20" }}
              >
                {restaurant.features.wifi && (
                  <div
                    className="flex items-center space-x-1 text-xs"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    <Wifi className="h-3 w-3" />
                    <span>WiFi</span>
                  </div>
                )}
                {restaurant.features.parking && (
                  <div
                    className="flex items-center space-x-1 text-xs"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    <Car className="h-3 w-3" />
                    <span>Estacionamiento</span>
                  </div>
                )}
                {restaurant.features.delivery && (
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color:
                        theme.id === "premium" ? theme.colors.text : "#000000",
                    }}
                  >
                    Delivery
                  </Badge>
                )}
                {restaurant.features.takeaway && (
                  <Badge
                    className="text-xs"
                    style={{
                      backgroundColor: theme.colors.secondary,
                      color:
                        theme.id === "premium" ? theme.colors.text : "#000000",
                    }}
                  >
                    Take Away
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Filtros y Búsqueda */}
      {showFilters && (
        <section className="container mx-auto px-4 pb-6">
          <Card
            className={`${theme.style.cardStyle} ${theme.style.borderRadius}`}
            style={{ backgroundColor: theme.colors.card }}
          >
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3 h-4 w-4"
                    style={{ color: theme.colors.textSecondary }}
                  />
                  <Input
                    placeholder="Buscar platos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    style={{
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.primary + "30",
                      color: theme.colors.text,
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    style={{
                      backgroundColor:
                        selectedCategory === "all"
                          ? theme.colors.primary
                          : "transparent",
                      borderColor: theme.colors.primary,
                      color:
                        selectedCategory === "all"
                          ? "white"
                          : theme.colors.primary,
                    }}
                  >
                    Todos
                  </Button>
                  {restaurant.menu_categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      style={{
                        backgroundColor:
                          selectedCategory === category.id
                            ? theme.colors.primary
                            : "transparent",
                        borderColor: theme.colors.primary,
                        color:
                          selectedCategory === category.id
                            ? "white"
                            : theme.colors.primary,
                      }}
                    >
                      {category.icon} {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Platos Destacados */}
      {featuredItems.length > 0 &&
        selectedCategory === "all" &&
        !searchTerm && (
          <section className="container mx-auto px-4 pb-6">
            <h3
              className="text-xl font-bold mb-4 flex items-center"
              style={{ color: theme.colors.primary }}
            >
              <Star className="h-5 w-5 mr-2 fill-current" />
              Platos Destacados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredItems.slice(0, 4).map((item) => (
                <Card
                  key={item.id}
                  className={`${theme.style.cardStyle} ${theme.style.borderRadius} cursor-pointer hover:shadow-lg transition-all duration-200`}
                  style={{ backgroundColor: theme.colors.card }}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4
                        className="font-medium text-lg"
                        style={{ color: theme.colors.text }}
                      >
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites.includes(item.id) ? "fill-current" : ""
                            }`}
                            style={{ color: theme.colors.accent }}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            shareItem(item);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Share2
                            className="h-4 w-4"
                            style={{ color: theme.colors.primary }}
                          />
                        </Button>
                      </div>
                    </div>
                    {item.description && (
                      <p
                        className="text-sm mb-3"
                        style={{ color: theme.colors.textSecondary }}
                      >
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p
                        className="font-bold text-xl"
                        style={{ color: theme.colors.primary }}
                      >
                        ${item.price}
                      </p>
                      <div className="flex items-center space-x-2">
                        {item.rating > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star
                              className="h-4 w-4 fill-current"
                              style={{ color: theme.colors.accent }}
                            />
                            <span
                              className="text-sm"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {item.rating}
                            </span>
                          </div>
                        )}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

      {/* Menú Principal */}
      <section className="container mx-auto px-4 pb-8">
        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {restaurant.menu_categories.slice(0, 3).map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center space-x-1"
              >
                <span>{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-6">
              {searchTerm ? (
                <div>
                  <h3
                    className="text-lg font-bold mb-4"
                    style={{ color: theme.colors.primary }}
                  >
                    Resultados de búsqueda ({filteredItems.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                      <Card
                        key={item.id}
                        className={`${theme.style.cardStyle} ${theme.style.borderRadius} cursor-pointer hover:shadow-lg transition-all duration-200`}
                        style={{ backgroundColor: theme.colors.card }}
                        onClick={() => handleItemClick(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4
                              className="font-medium"
                              style={{ color: theme.colors.text }}
                            >
                              {item.name}
                            </h4>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    favorites.includes(item.id)
                                      ? "fill-current"
                                      : ""
                                  }`}
                                  style={{ color: theme.colors.accent }}
                                />
                              </Button>
                            </div>
                          </div>
                          {item.description && (
                            <p
                              className="text-sm mb-3"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {item.description}
                            </p>
                          )}
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                restaurant.menu_categories.map((category) => (
                  <div key={category.id}>
                    <h3
                      className="text-xl font-bold mb-4 flex items-center"
                      style={{ color: theme.colors.primary }}
                    >
                      <span className="mr-2 text-2xl">{category.icon}</span>
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {category.menu_items
                        .filter((item) => item.is_available)
                        .map((item) => (
                          <Card
                            key={item.id}
                            className={`${theme.style.cardStyle} ${theme.style.borderRadius} cursor-pointer hover:shadow-lg transition-all duration-200`}
                            style={{ backgroundColor: theme.colors.card }}
                            onClick={() => handleItemClick(item)}
                          >
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4
                                  className="font-medium"
                                  style={{ color: theme.colors.text }}
                                >
                                  {item.name}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {item.is_featured && (
                                    <Star
                                      className="h-4 w-4 fill-current"
                                      style={{ color: theme.colors.accent }}
                                    />
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(item.id);
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Heart
                                      className={`h-4 w-4 ${
                                        favorites.includes(item.id)
                                          ? "fill-current"
                                          : ""
                                      }`}
                                      style={{ color: theme.colors.accent }}
                                    />
                                  </Button>
                                </div>
                              </div>
                              {item.description && (
                                <p
                                  className="text-sm mb-3"
                                  style={{ color: theme.colors.textSecondary }}
                                >
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <p
                                  className="font-bold text-lg"
                                  style={{ color: theme.colors.primary }}
                                >
                                  ${item.price}
                                </p>
                                <div className="flex items-center space-x-2">
                                  {item.rating > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <Star
                                        className="h-4 w-4 fill-current"
                                        style={{ color: theme.colors.accent }}
                                      />
                                      <span
                                        className="text-sm"
                                        style={{
                                          color: theme.colors.textSecondary,
                                        }}
                                      >
                                        {item.rating}
                                      </span>
                                    </div>
                                  )}
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
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {restaurant.menu_categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div>
                <h3
                  className="text-xl font-bold mb-4 flex items-center"
                  style={{ color: theme.colors.primary }}
                >
                  <span className="mr-2 text-2xl">{category.icon}</span>
                  {category.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.menu_items
                    .filter((item) => item.is_available)
                    .map((item) => (
                      <Card
                        key={item.id}
                        className={`${theme.style.cardStyle} ${theme.style.borderRadius} cursor-pointer hover:shadow-lg transition-all duration-200`}
                        style={{ backgroundColor: theme.colors.card }}
                        onClick={() => handleItemClick(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4
                              className="font-medium"
                              style={{ color: theme.colors.text }}
                            >
                              {item.name}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {item.is_featured && (
                                <Star
                                  className="h-4 w-4 fill-current"
                                  style={{ color: theme.colors.accent }}
                                />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(item.id);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    favorites.includes(item.id)
                                      ? "fill-current"
                                      : ""
                                  }`}
                                  style={{ color: theme.colors.accent }}
                                />
                              </Button>
                            </div>
                          </div>
                          {item.description && (
                            <p
                              className="text-sm mb-3"
                              style={{ color: theme.colors.textSecondary }}
                            >
                              {item.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <p
                              className="font-bold text-lg"
                              style={{ color: theme.colors.primary }}
                            >
                              ${item.price}
                            </p>
                            <div className="flex items-center space-x-2">
                              {item.rating > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Star
                                    className="h-4 w-4 fill-current"
                                    style={{ color: theme.colors.accent }}
                                  />
                                  <span
                                    className="text-sm"
                                    style={{
                                      color: theme.colors.textSecondary,
                                    }}
                                  >
                                    {item.rating}
                                  </span>
                                </div>
                              )}
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
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-8"
        style={{
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.primary + "20",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <p
            className="text-sm mb-2"
            style={{ color: theme.colors.textSecondary }}
          >
            Menú digital creado con
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="font-bold" style={{ color: theme.colors.primary }}>
              MenuData
            </span>
          </div>
          <p
            className="text-xs mt-2"
            style={{ color: theme.colors.textSecondary }}
          >
            ¿Querés tu menú digital? Visitá menudata.com
          </p>
        </div>
      </footer>

      {/* Modal de Detalle del Plato */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle
                  className="flex items-center justify-between"
                  style={{ color: theme.colors.text }}
                >
                  <span>{selectedItem.name}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(selectedItem.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          favorites.includes(selectedItem.id)
                            ? "fill-current"
                            : ""
                        }`}
                        style={{ color: theme.colors.accent }}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => shareItem(selectedItem)}
                      className="h-8 w-8 p-0"
                    >
                      <Share2
                        className="h-4 w-4"
                        style={{ color: theme.colors.primary }}
                      />
                    </Button>
                  </div>
                </DialogTitle>
                {selectedItem.description && (
                  <DialogDescription
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {selectedItem.description}
                  </DialogDescription>
                )}
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p
                    className="text-2xl font-bold"
                    style={{ color: theme.colors.primary }}
                  >
                    ${selectedItem.price}
                  </p>
                  <div className="flex items-center space-x-2">
                    {selectedItem.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star
                          className="h-4 w-4 fill-current"
                          style={{ color: theme.colors.accent }}
                        />
                        <span style={{ color: theme.colors.textSecondary }}>
                          {selectedItem.rating}
                        </span>
                      </div>
                    )}
                    {selectedItem.is_featured && (
                      <Badge
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

                {selectedItem.ingredients &&
                  selectedItem.ingredients.length > 0 && (
                    <div>
                      <h4
                        className="font-medium mb-2"
                        style={{ color: theme.colors.text }}
                      >
                        Ingredientes:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.ingredients.map((ingredient, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            style={{
                              borderColor: theme.colors.primary,
                              color: theme.colors.primary,
                            }}
                          >
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {selectedItem.allergens &&
                  selectedItem.allergens.length > 0 && (
                    <div>
                      <h4
                        className="font-medium mb-2"
                        style={{ color: theme.colors.text }}
                      >
                        Alérgenos:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.allergens.map((allergen, index) => (
                          <Badge
                            key={index}
                            style={{
                              backgroundColor: theme.colors.accent + "20",
                              color: theme.colors.text,
                            }}
                          >
                            ⚠️ {allergen}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                <Separator
                  style={{ backgroundColor: theme.colors.primary + "20" }}
                />

                <div className="text-center">
                  <p
                    className="text-sm"
                    style={{ color: theme.colors.textSecondary }}
                  >
                    {selectedItem.views} personas vieron este plato
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
