import type { NextRequest } from "next/server"
import { getAuthenticatedUser, createApiResponse, createErrorResponse } from "@/lib/auth-middleware"
import { updateMenuItemSchema } from "@/lib/validations"
import { supabase } from "@/lib/supabase"
import { SubscriptionTracker } from "@/lib/subscription-tracking"
import { z } from "zod" // Import zod for ZodError

// GET - Obtener item específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } },
) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    const { data: item, error } = await supabase
      .from("menu_items")
      .select(`
        *,
        menu_categories (
          id,
          name,
          restaurants (
            id,
            name,
            owner_id
          )
        )
      `)
      .eq("id", params.itemId)
      .eq("restaurant_id", params.id)
      .eq("category_id", params.categoryId)
      .single()

    if (error || !item) {
      return createErrorResponse("Item no encontrado", 404)
    }

    // Verificar que el restaurante pertenece al usuario
    if (item.menu_categories?.restaurants?.owner_id !== user.id) {
      return createErrorResponse("No autorizado", 403)
    }

    return createApiResponse({ item })
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

// PUT - Actualizar item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } },
) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    // Obtener datos actuales para verificación y log
    const { data: currentItem } = await supabase
      .from("menu_items")
      .select(`
        *,
        menu_categories (
          name,
          restaurants (
            id,
            name,
            owner_id
          )
        )
      `)
      .eq("id", params.itemId)
      .eq("restaurant_id", params.id)
      .eq("category_id", params.categoryId)
      .single()

    if (!currentItem) {
      return createErrorResponse("Item no encontrado", 404)
    }

    // Verificar que el restaurante pertenece al usuario
    if (currentItem.menu_categories?.restaurants?.owner_id !== user.id) {
      return createErrorResponse("No autorizado", 403)
    }

    const body = await request.json()
    const validatedData = updateMenuItemSchema.parse(body)

    // Actualizar el item
    const { data: item, error } = await supabase
      .from("menu_items")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.itemId)
      .eq("restaurant_id", params.id)
      .eq("category_id", params.categoryId)
      .select()
      .single()

    if (error) {
      console.error("Error updating menu item:", error)
      return createErrorResponse("Error al actualizar item del menú", 500)
    }

    // Log de actividad
    await SubscriptionTracker.logUserActivity({
      userId: user.id,
      eventType: "menu_item_updated",
      eventCategory: "menu",
      description: `Item "${item.name}" actualizado`,
      resourceId: item.id,
      resourceType: "menu_item",
      oldValues: currentItem,
      newValues: item,
    })

    // Actualizar métricas
    await SubscriptionTracker.updateUsageMetrics(user.id, "menu_items_updated", params.id)

    return createApiResponse({ item })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Datos inválidos: ${error.errors.map((e) => e.message).join(", ")}`, 400)
    }

    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

// DELETE - Eliminar item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } },
) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    // Obtener datos del item antes de eliminar
    const { data: item } = await supabase
      .from("menu_items")
      .select(`
        *,
        menu_categories (
          name,
          restaurants (
            id,
            name,
            owner_id
          )
        )
      `)
      .eq("id", params.itemId)
      .eq("restaurant_id", params.id)
      .eq("category_id", params.categoryId)
      .single()

    if (!item) {
      return createErrorResponse("Item no encontrado", 404)
    }

    // Verificar que el restaurante pertenece al usuario
    if (item.menu_categories?.restaurants?.owner_id !== user.id) {
      return createErrorResponse("No autorizado", 403)
    }

    // Eliminar el item
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", params.itemId)
      .eq("restaurant_id", params.id)
      .eq("category_id", params.categoryId)

    if (error) {
      console.error("Error deleting menu item:", error)
      return createErrorResponse("Error al eliminar item del menú", 500)
    }

    // Log de actividad
    await SubscriptionTracker.logUserActivity({
      userId: user.id,
      eventType: "menu_item_deleted",
      eventCategory: "menu",
      description: `Item "${item.name}" eliminado`,
      resourceId: item.id,
      resourceType: "menu_item",
      oldValues: item,
    })

    return createApiResponse({ message: "Item eliminado correctamente" })
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
