import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getClientIP, getUserAgent } from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// GET - Obtener restaurante público por slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select(`
        id,
        name,
        slug,
        description,
        phone,
        address,
        hours,
        website,
        theme,
        logo_url,
        features,
        created_at,
        menu_categories (
          id,
          name,
          icon,
          sort_order,
          menu_items (
            id,
            name,
            description,
            price,
            image_url,
            ingredients,
            allergens,
            is_featured,
            is_available,
            sort_order,
            views,
            rating
          )
        )
      `)
      .eq("slug", params.slug)
      .eq("is_active", true)
      .single()

    if (error || !restaurant) {
      return NextResponse.json({ error: "Restaurante no encontrado" }, { status: 404 })
    }

    // Filtrar solo categorías activas y items disponibles
    const filteredRestaurant = {
      ...restaurant,
      menu_categories: restaurant.menu_categories
        .filter((category) => category.menu_items.some((item) => item.is_available))
        .map((category) => ({
          ...category,
          menu_items: category.menu_items
            .filter((item) => item.is_available)
            .sort((a, b) => a.sort_order - b.sort_order),
        }))
        .sort((a, b) => a.sort_order - b.sort_order),
    }

    // Registrar vista del menú
    try {
      await supabase.from("menu_analytics").insert({
        restaurant_id: restaurant.id,
        event_type: "menu_view",
        user_agent: getUserAgent(request),
        ip_address: getClientIP(request),
        referrer: request.headers.get("referer"),
      })

      // Actualizar métricas de uso
      await supabase.rpc("update_usage_metrics", {
        p_user_id: restaurant.id, // En este caso usamos el restaurant_id como referencia
        p_restaurant_id: restaurant.id,
        p_metric_type: "menu_views",
        p_increment: 1,
      })
    } catch (analyticsError) {
      console.error("Error logging analytics:", analyticsError)
      // No fallar la request por errores de analytics
    }

    return NextResponse.json({ restaurant: filteredRestaurant })
  } catch (error) {
    console.error("Error in GET /api/public/restaurants/[slug]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
