import type { NextRequest } from "next/server"
import { getAuthenticatedUser, createApiResponse, createErrorResponse } from "@/lib/auth-middleware"
import { updateRestaurantSchema } from "@/lib/validations"
import { supabase } from "@/lib/supabase"
import { SubscriptionTracker } from "@/lib/subscription-tracking"
import { z } from "zod" // Import zod for ZodError

// GET - Obtener restaurante específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select(`
        *,
        menu_categories (
          id,
          name,
          icon,
          sort_order,
          is_active,
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
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .single()

    if (error || !restaurant) {
      return createErrorResponse("Restaurante no encontrado", 404)
    }

    return createApiResponse({ restaurant })
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

// PUT - Actualizar restaurante
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    const body = await request.json()
    const validatedData = updateRestaurantSchema.parse(body)

    // Obtener datos actuales para el log
    const { data: currentRestaurant } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .single()

    if (!currentRestaurant) {
      return createErrorResponse("Restaurante no encontrado", 404)
    }

    // Actualizar el restaurante
    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating restaurant:", error)
      return createErrorResponse("Error al actualizar restaurante", 500)
    }

    // Log de actividad
    await SubscriptionTracker.logUserActivity({
      userId: user.id,
      eventType: "restaurant_updated",
      eventCategory: "menu",
      description: `Restaurante "${restaurant.name}" actualizado`,
      resourceId: restaurant.id,
      resourceType: "restaurant",
      oldValues: currentRestaurant,
      newValues: restaurant,
    })

    return createApiResponse({ restaurant })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Datos inválidos: ${error.errors.map((e) => e.message).join(", ")}`, 400)
    }

    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

// DELETE - Eliminar restaurante
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    // Obtener datos del restaurante antes de eliminar
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .single()

    if (!restaurant) {
      return createErrorResponse("Restaurante no encontrado", 404)
    }

    // Eliminar el restaurante (cascade eliminará categorías e items)
    const { error } = await supabase.from("restaurants").delete().eq("id", params.id).eq("owner_id", user.id)

    if (error) {
      console.error("Error deleting restaurant:", error)
      return createErrorResponse("Error al eliminar restaurante", 500)
    }

    // Log de actividad
    await SubscriptionTracker.logUserActivity({
      userId: user.id,
      eventType: "restaurant_deleted",
      eventCategory: "menu",
      description: `Restaurante "${restaurant.name}" eliminado`,
      resourceId: restaurant.id,
      resourceType: "restaurant",
      oldValues: restaurant,
    })

    return createApiResponse({ message: "Restaurante eliminado correctamente" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
