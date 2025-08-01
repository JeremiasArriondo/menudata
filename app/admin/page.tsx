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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  BarChart3,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  Loader2,
  MenuIcon,
  MoreHorizontal,
  Plus,
  QrCode,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  theme: string;
  is_active: boolean;
  created_at: string;
  categories: Category[];
  _count: {
    categories: number;
    total_items: number;
  };
  total_views: number;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  name: string;
  view_count: number;
}

export default function AdminPage() {
  const { user, session, loading: authLoading, isConfigured } = useAuth();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && isConfigured && !user) {
      router.push("/login");
    }
  }, [user, authLoading, isConfigured, router]);

  // Load restaurants
  useEffect(() => {
    if (user || !isConfigured) {
      loadRestaurants();
    }
  }, [user, isConfigured]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/restaurants", {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRestaurants(data.restaurants || data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al cargar restaurantes");
      }
    } catch (error) {
      console.error("Error loading restaurants:", error);
      setError("Error al cargar restaurantes");
    } finally {
      setLoading(false);
    }
  };

  const toggleRestaurantStatus = async (
    restaurantId: string,
    isActive: boolean
  ) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ is_active: !isActive }),
      });

      if (response.ok) {
        loadRestaurants();
      }
    } catch (error) {
      console.error("Error updating restaurant status:", error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Modo Demo</h2>
            <p className="text-gray-600 mb-4">
              La autenticación no está configurada. Esta es una versión de
              demostración.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalViews = restaurants.reduce(
    (sum, restaurant) => sum + (restaurant.total_views || 0),
    0
  );
  const totalItems = restaurants.reduce(
    (sum, restaurant) => sum + (restaurant._count?.total_items || 0),
    0
  );
  const activeRestaurants = restaurants.filter((r) => r.is_active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Panel de Administración
              </h1>
              <p className="text-gray-600 mt-1">
                Gestiona tus restaurantes y menús digitales
              </p>
            </div>
            <Link href="/crear-menu">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Restaurante
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Restaurantes
              </CardTitle>
              <MenuIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurants.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeRestaurants} activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vistas
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +20.1% desde el mes pasado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platos Totales
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">
                En{" "}
                {restaurants.reduce(
                  (sum, r) => sum + (r._count?.categories || 0),
                  0
                )}{" "}
                categorías
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Promedio Vistas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurants.length > 0
                  ? Math.round(totalViews / restaurants.length)
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Por restaurante</p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants List */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Restaurantes</CardTitle>
            <CardDescription>
              Gestiona todos tus menús digitales desde aquí
            </CardDescription>
          </CardHeader>
          <CardContent>
            {restaurants.length === 0 ? (
              <div className="text-center py-12">
                <MenuIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes restaurantes aún
                </h3>
                <p className="text-gray-600 mb-4">
                  Crea tu primer restaurante para comenzar a gestionar tu menú
                  digital
                </p>
                <Link href="/crear-menu">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Restaurante
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {restaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {restaurant.name}
                            </h3>
                            <Badge
                              variant={
                                restaurant.is_active ? "default" : "secondary"
                              }
                            >
                              {restaurant.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {restaurant.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4 text-gray-400" />
                              <span>
                                {restaurant._count?.categories || 0} categorías
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>
                                {restaurant._count?.total_items || 0} platos
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Eye className="h-4 w-4 text-gray-400" />
                              <span>{restaurant.total_views || 0} vistas</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>
                                {new Date(
                                  restaurant.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link href={`/${restaurant.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Menú
                            </Button>
                          </Link>

                          <Link href={`/editar-menu?id=${restaurant.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </Link>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleRestaurantStatus(
                                    restaurant.id,
                                    restaurant.is_active
                                  )
                                }
                              >
                                {restaurant.is_active
                                  ? "Desactivar"
                                  : "Activar"}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <QrCode className="h-4 w-4 mr-2" />
                                Descargar QR
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Compartir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
