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
  description: string;
  price: number;
  category: string;
  featured: boolean;
  available: boolean;
  image?: string;
  views: number;
  rating: number;
  ingredients?: string[];
  allergens?: string[];
}

interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  phone?: string;
  address?: string;
  hours?: string;
  website?: string;
  theme: MenuTheme;
  categories: MenuCategory[];
  features?: {
    wifi: boolean;
    parking: boolean;
    delivery: boolean;
    takeaway: boolean;
  };
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

export default function RestaurantMenuPage() {
  const params = useParams();
  const restaurantSlug = params.restaurantSlug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Datos de ejemplo - en producción vendría de la API
  useEffect(() => {
    const loadRestaurantData = async () => {
      setLoading(true);

      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockRestaurant: Restaurant = {
        id: "1",
        name: "La Pizzería de Mario",
        slug: restaurantSlug,
        description: "Auténtica cocina italiana en el corazón de la ciudad",
        phone: "+54 9 11 1234-5678",
        address: "Av. Corrientes 1234, CABA",
        hours: "Lun-Dom: 18:00 - 00:00",
        website: "www.pizzeriamario.com",
        features: {
          wifi: true,
          parking: false,
          delivery: true,
          takeaway: true,
        },
        theme: {
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
        categories: [
          {
            id: "entradas",
            name: "Entradas",
            icon: "🍕",
            items: [
              {
                id: "1",
                name: "Pizza Margherita",
                description: "Tomate, mozzarella, albahaca fresca",
                price: 2500,
                category: "entradas",
                featured: true,
                available: true,
                views: 156,
                rating: 4.8,
                ingredients: [
                  "Tomate",
                  "Mozzarella",
                  "Albahaca",
                  "Aceite de oliva",
                ],
                allergens: ["Gluten", "Lácteos"],
              },
              {
                id: "2",
                name: "Empanadas Criollas",
                description: "Carne cortada a cuchillo, cebolla, huevo",
                price: 800,
                category: "entradas",
                featured: false,
                available: true,
                views: 89,
                rating: 4.5,
                ingredients: ["Carne", "Cebolla", "Huevo", "Aceitunas"],
              },
              {
                id: "3",
                name: "Bruschetta Italiana",
                description: "Pan tostado con tomate, ajo y albahaca",
                price: 1200,
                category: "entradas",
                featured: false,
                available: true,
                views: 67,
                rating: 4.3,
              },
            ],
          },
          {
            id: "principales",
            name: "Principales",
            icon: "🥘",
            items: [
              {
                id: "4",
                name: "Milanesa Napolitana",
                description: "Con papas fritas caseras",
                price: 3200,
                category: "principales",
                featured: true,
                available: true,
                views: 234,
                rating: 4.9,
                ingredients: [
                  "Carne",
                  "Pan rallado",
                  "Tomate",
                  "Jamón",
                  "Queso",
                ],
              },
              {
                id: "5",
                name: "Bife de Chorizo",
                description: "Con ensalada mixta",
                price: 4500,
                category: "principales",
                featured: false,
                available: false,
                views: 67,
                rating: 4.7,
              },
              {
                id: "6",
                name: "Pasta Carbonara",
                description: "Spaghetti con panceta, huevo y parmesano",
                price: 2800,
                category: "principales",
                featured: true,
                available: true,
                views: 145,
                rating: 4.6,
              },
            ],
          },
          {
            id: "postres",
            name: "Postres",
            icon: "🍰",
            items: [
              {
                id: "7",
                name: "Tiramisu Casero",
                description: "Receta tradicional italiana",
                price: 1800,
                category: "postres",
                featured: false,
                available: true,
                views: 123,
                rating: 4.6,
              },
              {
                id: "8",
                name: "Panna Cotta",
                description: "Con frutos rojos",
                price: 1600,
                category: "postres",
                featured: false,
                available: true,
                views: 89,
                rating: 4.4,
              },
            ],
          },
          {
            id: "bebidas",
            name: "Bebidas",
            icon: "🥤",
            items: [
              {
                id: "9",
                name: "Agua Mineral",
                description: "500ml",
                price: 500,
                category: "bebidas",
                featured: false,
                available: true,
                views: 45,
                rating: 4.2,
              },
              {
                id: "10",
                name: "Vino Tinto de la Casa",
                description: "Copa - Malbec argentino",
                price: 1200,
                category: "bebidas",
                featured: true,
                available: true,
                views: 78,
                rating: 4.5,
              },
            ],
          },
        ],
      };

      setRestaurant(mockRestaurant);
      setLoading(false);
    };

    loadRestaurantData();
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

  const filteredItems =
    restaurant?.categories.flatMap((category) =>
      category.items.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === "all" || item.category === selectedCategory;
        const isAvailable = item.available;

        return matchesSearch && matchesCategory && isAvailable;
      })
    ) || [];

  const featuredItems =
    restaurant?.categories.flatMap((category) =>
      category.items.filter((item) => item.featured && item.available)
    ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary-100 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-text-100">Cargando menú...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-brand-bg-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="text-6xl mb-4">🍽️</div>
            <h2 className="text-2xl font-bold text-brand-text-200 mb-2">
              Restaurante no encontrado
            </h2>
            <p className="text-brand-text-100 mb-4">
              No pudimos encontrar el menú que buscas. Verifica la URL o
              contacta al restaurante.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const theme = restaurant.theme;

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
                  {restaurant.categories.map((category) => (
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
                  onClick={() => setSelectedItem(item)}
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
                    <p
                      className="text-sm mb-3"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {item.description}
                    </p>
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
            {restaurant.categories.map((category) => (
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
                        onClick={() => setSelectedItem(item)}
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
                          <p
                            className="text-sm mb-3"
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                restaurant.categories.map((category) => (
                  <div key={category.id}>
                    <h3
                      className="text-xl font-bold mb-4 flex items-center"
                      style={{ color: theme.colors.primary }}
                    >
                      <span className="mr-2 text-2xl">{category.icon}</span>
                      {category.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {category.items
                        .filter((item) => item.available)
                        .map((item) => (
                          <Card
                            key={item.id}
                            className={`${theme.style.cardStyle} ${theme.style.borderRadius} cursor-pointer hover:shadow-lg transition-all duration-200`}
                            style={{ backgroundColor: theme.colors.card }}
                            onClick={() => setSelectedItem(item)}
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
                                  {item.featured && (
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
                              <p
                                className="text-sm mb-3"
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
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {restaurant.categories.map((category) => (
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
                  {category.items
                    .filter((item) => item.available)
                    .map((item) => (
                      <Card
                        key={item.id}
                        className={`${theme.style.cardStyle} ${theme.style.borderRadius} cursor-pointer hover:shadow-lg transition-all duration-200`}
                        style={{ backgroundColor: theme.colors.card }}
                        onClick={() => setSelectedItem(item)}
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
                              {item.featured && (
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
                          <p
                            className="text-sm mb-3"
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
            <div className="h-6 w-6 rounded bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
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
                <DialogDescription
                  style={{ color: theme.colors.textSecondary }}
                >
                  {selectedItem.description}
                </DialogDescription>
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
                    {selectedItem.featured && (
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

                {selectedItem.ingredients && (
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

                {selectedItem.allergens && (
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
