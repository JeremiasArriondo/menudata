import type { NextRequest } from "next/server"
import { getAuthenticatedUser, createApiResponse, createErrorResponse } from "@/lib/auth-middleware"
import { restaurantSchema } from "@/lib/validations"
import { supabase } from "@/lib/supabase"
import { SubscriptionTracker } from "@/lib/subscription-tracking"
import { z } from "zod" // Import zod for ZodError

// GET - Obtener restaurantes del usuario
export async function GET(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    const { data: restaurants, error } = await supabase
      .from("restaurants")
      .select(`
        *,
        menu_categories (
          id,
          name,
          icon,
          sort_order,
          menu_items (
            id,
            name,
            price,
            is_available
          )
        )
      `)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching restaurants:", error)
      return createErrorResponse("Error al obtener restaurantes", 500)
    }

    // Log de actividad
    await SubscriptionTracker.logUserActivity({
      userId: user.id,
      eventType: "restaurants_viewed",
      eventCategory: "api",
      description: "Usuario consultó sus restaurantes",
    })

    return createApiResponse({ restaurants: restaurants || [] })
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

// POST - Crear nuevo restaurante
export async function POST(request: NextRequest) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    const body = await request.json()
    const validatedData = restaurantSchema.parse(body)

    // Verificar límites del plan
    const limits = await SubscriptionTracker.checkPlanLimits(user.id, "restaurants")
    if (!limits.withinLimits) {
      return createErrorResponse(`Has alcanzado el límite de restaurantes (${limits.limit}) para tu plan actual`, 403)
    }

    // Verificar que el slug sea único
    const { data: existingRestaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("slug", validatedData.slug)
      .single()

    if (existingRestaurant) {
      return createErrorResponse("Este slug ya está en uso", 409)
    }

    // Crear el restaurante
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .insert({
        ...validatedData,
        owner_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating restaurant:", error)
      return createErrorResponse("Error al crear restaurante", 500)
    }

    // Crear categorías por defecto
    const defaultCategories = [
      { name: "Entradas", icon: "🥗", sort_order: 0 },
      { name: "Platos Principales", icon: "🍽️", sort_order: 1 },
      { name: "Postres", icon: "🍰", sort_order: 2 },
      { name: "Bebidas", icon: "🥤", sort_order: 3 },
    ]

    const { error: categoriesError } = await supabase.from("menu_categories").insert(
      defaultCategories.map((cat) => ({
        ...cat,
        restaurant_id: restaurant.id,
      })),
    )

    if (categoriesError) {
      console.error("Error creating default categories:", categoriesError)
    }

    // Log de actividad
    await SubscriptionTracker.logUserActivity({
      userId: user.id,
      eventType: "restaurant_created",
      eventCategory: "menu",
      description: `Restaurante "${restaurant.name}" creado`,
      resourceId: restaurant.id,
      resourceType: "restaurant",
      newValues: restaurant,
    })

    // Actualizar métricas
    await SubscriptionTracker.updateUsageMetrics(user.id, "categories_created", restaurant.id, 4)

    return createApiResponse({ restaurant }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Datos inválidos: ${error.errors.map((e) => e.message).join(", ")}`, 400)
    }

    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
