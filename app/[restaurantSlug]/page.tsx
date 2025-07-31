import { Card, CardContent } from "@/components/ui/card";
import MenuItemList from "@/components/ui/menu-item-list";
import { supabase } from "@/lib/supabase";
import { Clock, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  hours: string | null;
  theme: string;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
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
  created_at: string;
  updated_at: string;
}

interface RestaurantData {
  restaurant: Restaurant;
  categories: Category[];
  menuItems: MenuItem[];
}

async function getRestaurantData(slug: string): Promise<RestaurantData | null> {
  try {
    const { data: restaurant, error: restaurantError } = await supabase!
      .from("restaurants")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (restaurantError || !restaurant) {
      return null;
    }

    const { data: categories, error: categoriesError } = await supabase!
      .from("menu_categories")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (categoriesError) {
      return null;
    }

    // Obtener items de menú
    const { data: menuItems, error: itemsError } = await supabase!
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .eq("is_available", true)
      .order("sort_order", { ascending: true });

    if (itemsError) {
      return null;
    }

    return {
      restaurant,
      categories: categories || [],
      menuItems: menuItems || [],
    };
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }
}

async function incrementViewCount(itemId: string) {
  try {
    await fetch(`/api/public/restaurants/${itemId}/view`, {
      method: "POST",
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
}

const themes = {
  elegant: {
    bg: "bg-gradient-to-br from-slate-50 to-gray-100",
    card: "bg-white border-gray-200 shadow-sm",
    text: "text-gray-900",
    accent: "text-amber-600",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  modern: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
    card: "bg-white border-blue-200 shadow-sm",
    text: "text-gray-900",
    accent: "text-blue-600",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  warm: {
    bg: "bg-gradient-to-br from-orange-50 to-red-100",
    card: "bg-white border-orange-200 shadow-sm",
    text: "text-gray-900",
    accent: "text-orange-600",
    button: "bg-orange-600 hover:bg-orange-700 text-white",
  },
  fresh: {
    bg: "bg-gradient-to-br from-green-50 to-emerald-100",
    card: "bg-white border-green-200 shadow-sm",
    text: "text-gray-900",
    accent: "text-green-600",
    button: "bg-green-600 hover:bg-green-700 text-white",
  },
  dark: {
    bg: "bg-gradient-to-br from-gray-900 to-black",
    card: "bg-gray-800 border-gray-700 shadow-lg",
    text: "text-white",
    accent: "text-purple-400",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
  },
};

export default async function RestaurantPage({
  params,
}: {
  params: { restaurantSlug: string };
}) {
  const { restaurantSlug } = params;

  const data = await getRestaurantData(restaurantSlug);

  if (!data || !data.restaurant) {
    notFound();
  }

  const { restaurant, categories, menuItems } = data;

  console.log({ restaurant });

  const theme =
    themes[restaurant.theme as keyof typeof themes] || themes.elegant;

  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category_id]) {
      acc[item.category_id] = [];
    }
    acc[item.category_id].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* Header del restaurante */}
      <div className="relative">
        <div className="relative px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className={`${theme.card} p-6`}>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {restaurant.logo_url && (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-lg flex-shrink-0">
                    <Image
                      src={restaurant.logo_url || "/placeholder.svg"}
                      alt={`Logo de ${restaurant.name}`}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <h1
                    className={`text-3xl md:text-4xl font-bold ${theme.text} mb-2`}
                  >
                    {restaurant.name}
                  </h1>

                  {restaurant.description && (
                    <p className={`text-lg ${theme.text} opacity-80 mb-4`}>
                      {restaurant.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm">
                    {restaurant.address && (
                      <div
                        className={`flex items-center gap-2 ${theme.accent}`}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>{restaurant.address}</span>
                      </div>
                    )}

                    {restaurant.phone && (
                      <div
                        className={`flex items-center gap-2 ${theme.accent}`}
                      >
                        <Phone className="h-4 w-4" />
                        <span>{restaurant.phone}</span>
                      </div>
                    )}

                    {restaurant.hours && (
                      <div
                        className={`flex items-center gap-2 ${theme.accent}`}
                      >
                        <Clock className="h-4 w-4" />
                        <span>{restaurant.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Menú */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {categories.length === 0 ? (
          <Card className={`${theme.card} text-center py-12`}>
            <CardContent>
              <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>
                Menú en construcción
              </h2>
              <p className={`${theme.text} opacity-70`}>
                Estamos preparando nuestro delicioso menú. ¡Vuelve pronto!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.id} className="mb-12">
                <div className="mb-6">
                  <h2
                    className={`text-2xl md:text-3xl font-bold ${theme.text} mb-2`}
                  >
                    {category.name}
                  </h2>
                </div>

                <div className="grid gap-4 md:gap-6">
                  <MenuItemList
                    items={itemsByCategory[category.id] || []}
                    theme={theme}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            Menú digital creado con{" "}
            <span className="font-semibold text-orange-600">MenuData</span>
          </p>
        </div>
      </div>
    </div>
  );
}
