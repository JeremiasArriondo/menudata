"use client";

import { useAuth } from "@/components/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Edit,
  ExternalLink,
  Eye,
  Loader2,
  Plus,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  theme: string;
  phone: string;
  address: string;
  is_active: boolean;
  created_at: string;
  menu_categories: Array<{
    id: string;
    name: string;
    icon: string;
    sort_order: number;
    menu_items: Array<{
      id: string;
      name: string;
      price: number;
      is_available: boolean;
    }>;
  }>;
}

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check for success message
  const restaurantSlug = searchParams.get("restaurant");
  const showSuccess = searchParams.get("success") === "true";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch restaurants
  useEffect(() => {
    if (user && session?.access_token) {
      fetchRestaurants();
    }
  }, [user, session]);

  const fetchRestaurants = async () => {
    if (!session?.access_token) return;

    try {
      setLoading(true);
      const response = await fetch("/api/restaurants", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar restaurantes");
      }

      const data = await response.json();
      setRestaurants(data.restaurants || []);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setError(
        error instanceof Error ? error.message : "Error al cargar restaurantes"
      );
    } finally {
      setLoading(false);
    }
  };

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

  const getThemeEmoji = (theme: string) => {
    const themeMap: Record<string, string> = {
      clasico: "🏛️",
      moderno: "✨",
      elegante: "💎",
      colorido: "🌈",
      rustico: "🏕️",
      premium: "👑",
    };
    return themeMap[theme] || "🍽️";
  };

  return (
    <div className="min-h-screen bg-brand-bg-100">
      {/* Header */}
      <header className="bg-white dark:bg-brand-text-100 shadow-sm border-b border-brand-bg-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 bg-clip-text text-transparent">
                  Panel de Administración
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-brand-text-100">
                Hola, {user.user_metadata?.full_name || user.email}
              </span>
              <Link href="/crear-menu">
                <Button className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Menú
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Success Alert */}
        {showSuccess && restaurantSlug && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              ¡Menú creado exitosamente! Tu restaurante ya está disponible en{" "}
              <Link
                href={`/${restaurantSlug}`}
                className="font-medium underline hover:no-underline"
                target="_blank"
              >
                menudata.com/{restaurantSlug}
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-500 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary-100 mx-auto mb-4" />
            <p className="text-brand-text-100">Cargando tus restaurantes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && restaurants.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="h-24 w-24 bg-brand-bg-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-12 w-12 text-brand-text-100" />
              </div>
              <h2 className="text-2xl font-bold text-brand-text-200 mb-2">
                ¡Crea tu primer menú!
              </h2>
              <p className="text-brand-text-100 mb-6">
                Comienza creando tu menú digital. Es rápido y fácil.
              </p>
              <Link href="/crear-menu">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-brand-primary-100 to-brand-primary-200 hover:from-brand-primary-200 hover:to-brand-primary-100 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Mi Primer Menú
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && restaurants.length > 0 && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-brand-text-200 mb-2">
                Mis Restaurantes
              </h1>
              <p className="text-brand-text-100">
                Gestiona tus menús digitales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => {
                const totalItems = restaurant.menu_categories.reduce(
                  (acc, cat) => acc + cat.menu_items.length,
                  0
                );
                const activeCategories = restaurant.menu_categories.filter(
                  (cat) => cat.menu_items.length > 0
                ).length;

                return (
                  <Card
                    key={restaurant.id}
                    className="bg-white dark:bg-brand-text-100/10 border-brand-bg-300 hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getThemeEmoji(restaurant.theme)}
                          </span>
                          <div>
                            <CardTitle className="text-lg text-brand-text-200">
                              {restaurant.name}
                            </CardTitle>
                            <p className="text-sm text-brand-text-100">
                              menudata.com/{restaurant.slug}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={`${
                            restaurant.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {restaurant.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      {restaurant.description && (
                        <p className="text-sm text-brand-text-100 mt-2">
                          {restaurant.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-brand-bg-100 p-3 rounded-lg text-center">
                          <p className="text-xl font-bold text-brand-primary-100">
                            {totalItems}
                          </p>
                          <p className="text-xs text-brand-text-100">Platos</p>
                        </div>
                        <div className="bg-brand-bg-100 p-3 rounded-lg text-center">
                          <p className="text-xl font-bold text-brand-accent-200">
                            {activeCategories}
                          </p>
                          <p className="text-xs text-brand-text-100">
                            Categorías
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/${restaurant.slug}`} target="_blank">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-brand-primary-100 text-brand-primary-100 hover:bg-brand-primary-100 hover:text-white bg-transparent"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Menú
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-brand-text-100 text-brand-text-100 hover:bg-brand-text-100 hover:text-white bg-transparent"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-brand-accent-100 text-brand-accent-100 hover:bg-brand-accent-100 hover:text-white bg-transparent"
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          QR
                        </Button>
                      </div>

                      {/* Additional Info */}
                      <div className="text-xs text-brand-text-100 pt-2 border-t border-brand-bg-300">
                        <p>
                          Creado:{" "}
                          {new Date(restaurant.created_at).toLocaleDateString()}
                        </p>
                        <p>Tema: {restaurant.theme}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
