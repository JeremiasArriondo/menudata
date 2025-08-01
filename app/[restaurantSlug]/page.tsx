import ViewTracker from "@/components/ui/view-tracker";
import { getThemeById } from "@/lib/menu-themes";
import { supabase } from "@/lib/supabase";
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

  const theme = getThemeById(restaurant.theme);

  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category_id]) {
      acc[item.category_id] = [];
    }
    acc[item.category_id].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className={`min-h-screen ${theme.classes.bg}`}>
      <ViewTracker restaurantId={restaurant.id} />

      <div className="container mx-auto px-4 py-8">
        {/* Header del restaurante */}
        <div
          className={`${theme.classes.card} ${theme.style.borderRadius} ${theme.classes.border} p-8 mb-8`}
        >
          <div className={`text-center ${theme.style.headerStyle}`}>
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 ${theme.classes.text} ${theme.style.fontFamily}`}
            >
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <p
                className={`text-lg ${theme.classes.textSecondary} max-w-2xl mx-auto`}
              >
                {restaurant.description}
              </p>
            )}
          </div>

          {/* Información de contacto */}
          {(restaurant.phone || restaurant.address || restaurant.website) && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {restaurant.phone && (
                <div className={theme.classes.textSecondary}>
                  <div className="font-medium">Teléfono</div>
                  <div>{restaurant.phone}</div>
                </div>
              )}
              {restaurant.address && (
                <div className={theme.classes.textSecondary}>
                  <div className="font-medium">Dirección</div>
                  <div>{restaurant.address}</div>
                </div>
              )}
              {restaurant.website && (
                <div className={theme.classes.textSecondary}>
                  <div className="font-medium">Sitio Web</div>
                  <a
                    href={restaurant.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.classes.accent} hover:underline`}
                  >
                    Visitar
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Redes sociales */}
          {(restaurant.instagram ||
            restaurant.facebook ||
            restaurant.whatsapp) && (
            <div className="mt-6 flex justify-center gap-4">
              {restaurant.instagram && (
                <a
                  href={`https://instagram.com/${restaurant.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme.classes.button} px-4 py-2 ${theme.style.borderRadius} text-sm font-medium transition-colors`}
                >
                  Instagram
                </a>
              )}
              {restaurant.facebook && (
                <a
                  href={`https://facebook.com/${restaurant.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme.classes.button} px-4 py-2 ${theme.style.borderRadius} text-sm font-medium transition-colors`}
                >
                  Facebook
                </a>
              )}
              {restaurant.whatsapp && (
                <a
                  href={`https://wa.me/${restaurant.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme.classes.button} px-4 py-2 ${theme.style.borderRadius} text-sm font-medium transition-colors`}
                >
                  WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        {/* Menú */}
        <div className="space-y-8">
          {categories?.map((category) => {
            const items = itemsByCategory[category.id] || [];
            if (items.length === 0) return null;

            return (
              <div key={category.id}>
                <div className="mb-6">
                  <h2
                    className={`text-3xl font-bold ${theme.classes.categoryTitle} pb-2 ${theme.style.fontFamily}`}
                  >
                    {category.name}
                  </h2>
                  {category?.description && (
                    <p className={`${theme.classes.textSecondary} mt-2`}>
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`${theme.classes.card} ${theme.style.borderRadius} ${theme.classes.border} p-6 hover:shadow-lg transition-shadow`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3
                          className={`text-xl font-semibold ${theme.classes.text} ${theme.style.fontFamily}`}
                        >
                          {item.name}
                        </h3>
                        <span
                          className={`text-xl font-bold ${theme.classes.price} ml-4`}
                        >
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {item.description && (
                        <p
                          className={`${theme.classes.textSecondary} mb-4 leading-relaxed`}
                        >
                          {item.description}
                        </p>
                      )}

                      {/* Badges para características especiales */}
                      {(item.is_vegetarian ||
                        item.is_vegan ||
                        item.is_gluten_free) && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.is_vegetarian && (
                            <span
                              className={`px-2 py-1 text-xs ${theme.style.borderRadius} bg-green-100 text-green-800`}
                            >
                              Vegetariano
                            </span>
                          )}
                          {item.is_vegan && (
                            <span
                              className={`px-2 py-1 text-xs ${theme.style.borderRadius} bg-green-100 text-green-800`}
                            >
                              Vegano
                            </span>
                          )}
                          {item.is_gluten_free && (
                            <span
                              className={`px-2 py-1 text-xs ${theme.style.borderRadius} bg-blue-100 text-blue-800`}
                            >
                              Sin Gluten
                            </span>
                          )}
                        </div>
                      )}

                      {/* Imagen del plato */}
                      {item.image_url && (
                        <div className="mt-4">
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className={`w-full h-48 object-cover ${theme.style.borderRadius}`}
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div
            className={`${theme.classes.card} ${theme.style.borderRadius} ${theme.classes.border} p-6`}
          >
            <p className={`${theme.classes.textSecondary} text-sm`}>
              Menú digital creado con ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
