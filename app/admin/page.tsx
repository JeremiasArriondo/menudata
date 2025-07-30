"use client";

import { useAuth } from "@/components/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle,
  Edit,
  ExternalLink,
  Eye,
  Loader2,
  MenuIcon,
  Plus,
  QrCode,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface RestaurantType {
  id: string;
  name: string;
  slug: string;
  description: string;
  theme: string;
  is_active: boolean;
  created_at: string;
  _count?: {
    categories: number;
    items: number;
  };
}

export default function AdminPage() {
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  useEffect(() => {
    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);

      // Obtener restaurantes del usuario
      const { data: restaurantsData, error: restaurantsError } = await supabase!
        .from("restaurants")
        .select(
          `
          id,
          name,
          slug,
          description,
          theme,
          is_active,
          created_at
        `
        )
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (restaurantsError) {
        throw restaurantsError;
      }

      // Para cada restaurante, obtener el conteo de categorías e items
      const restaurantsWithCounts = await Promise.all(
        (restaurantsData || []).map(async (restaurant) => {
          const [categoriesResult, itemsResult] = await Promise.all([
            supabase!
              .from("menu_categories")
              .select("id", { count: "exact" })
              .eq("restaurant_id", restaurant.id),
            supabase!
              .from("menu_items")
              .select("id", { count: "exact" })
              .eq("restaurant_id", restaurant.id),
          ]);

          return {
            ...restaurant,
            _count: {
              categories: categoriesResult.count || 0,
              items: itemsResult.count || 0,
            },
          };
        })
      );

      setRestaurants(restaurantsWithCounts);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError("Error al cargar los restaurantes");
    } finally {
      setLoading(false);
    }
  };

  const getThemeLabel = (theme: string) => {
    const themes: Record<string, string> = {
      clasico: "Clásico",
      moderno: "Moderno",
      elegante: "Elegante",
      colorido: "Colorido",
      rustico: "Rústico",
      premium: "Premium",
    };
    return themes[theme] || theme;
  };

  const getThemeColor = (theme: string) => {
    const colors: Record<string, string> = {
      clasico: "bg-amber-100 text-amber-800",
      moderno: "bg-blue-100 text-blue-800",
      elegante: "bg-purple-100 text-purple-800",
      colorido: "bg-pink-100 text-pink-800",
      rustico: "bg-green-100 text-green-800",
      premium: "bg-gray-100 text-gray-800",
    };
    return colors[theme] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando tus restaurantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-2">Gestiona tus menús digitales</p>
        </div>

        {/* Success Alert */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ¡Menú creado exitosamente! Ya puedes compartir tu menú digital.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="mb-6">
          <Link href="/crear-menu">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Nuevo Menú
            </Button>
          </Link>
        </div>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MenuIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes restaurantes aún
              </h3>
              <p className="text-gray-600 mb-4">
                Crea tu primer menú digital para empezar
              </p>
              <Link href="/crear-menu">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Mi Primer Menú
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {restaurant.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {restaurant.description || "Sin descripción"}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={restaurant.is_active ? "default" : "secondary"}
                      className={
                        restaurant.is_active
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                    >
                      {restaurant.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>
                        {restaurant._count?.categories || 0} categorías
                      </span>
                      <span>{restaurant._count?.items || 0} platos</span>
                    </div>

                    {/* Theme */}
                    <div>
                      <Badge className={getThemeColor(restaurant.theme)}>
                        {getThemeLabel(restaurant.theme)}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/${restaurant.slug}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-1 h-3 w-3" />
                          Ver Menú
                        </Button>
                      </Link>

                      <Link href={`/editar-menu?id=${restaurant.id}`}>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-1 h-3 w-3" />
                          Editar
                        </Button>
                      </Link>

                      <Button size="sm" variant="outline">
                        <QrCode className="mr-1 h-3 w-3" />
                        QR
                      </Button>

                      <Button size="sm" variant="outline">
                        <Share2 className="mr-1 h-3 w-3" />
                        Compartir
                      </Button>
                    </div>

                    {/* URL */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span className="truncate">
                          {window.location.origin}/{restaurant.slug}
                        </span>
                        <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
