import type { NextRequest } from "next/server"
import { getAuthenticatedUser, createApiResponse, createErrorResponse } from "@/lib/auth-middleware"
import { menuItemSchema } from "@/lib/validations"
import { supabase } from "@/lib/supabase"
import { SubscriptionTracker } from "@/lib/subscription-tracking"
import { z } from "zod" // Import zod for ZodError

// GET - Obtener items de una categoría
export async function GET(request: NextRequest, { params }: { params: { id: string; categoryId: string } }) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    // Verificar que el restaurante pertenece al usuario
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .single()

    if (!restaurant) {
      return createErrorResponse("Restaurante no encontrado", 404)
    }

    const { data: items, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", params.id)
      .eq("category_id", params.categoryId)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching menu items:", error)
      return createErrorResponse("Error al obtener items del menú", 500)
    }

    return createApiResponse({ items: items || [] })
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

// POST - Crear nuevo item de menú
export async function POST(request: NextRequest, { params }: { params: { id: string; categoryId: string } }) {
  const { user, error: authError } = await getAuthenticatedUser(request)
  if (authError || !user) {
    return createErrorResponse("No autorizado", 401)
  }

  if (!supabase) {
    return createErrorResponse("Servicio no disponible", 503)
  }

  try {
    // Verificar que el restaurante pertenece al usuario
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq("id", params.id)
      .eq("owner_id", user.id)
      .single()

    if (!restaurant) {
      return createErrorResponse("Restaurante no encontrado", 404)
    }

    // Verificar límites del plan
    const limits = await SubscriptionTracker.checkPlanLimits(user.id, "menu_items")
    if (!limits.withinLimits) {
      return createErrorResponse(`Has alcanzado el límite de items de menú (${limits.limit}) para tu plan actual`, 403)
    }

    // Verificar que la categoría existe y pertenece al restaurante
    const { data: category } = await supabase
      .from("menu_categories")
      .select("id, name")
      .eq("id", params.categoryId)
      .eq("restaurant_id", params.id)
      .single()

    if (!category) {
      return createErrorResponse("Categoría no encontrada", 404)
    }

    const body = await request.json()
    const validatedData = menuItemSchema.parse({
      ...body,
      category_id: params.categoryId,
    })

    // Crear el item
    const { data: item, error } = await supabase
      .from("menu_items")
      .insert({
        ...validatedData,
        restaurant_id: params.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating menu item:", error)
      return createErrorResponse("Error al crear item del menú", 500)
    }

    // Log de actividad
    await SubscriptionTracker.logUserActivity({
      userId: user.id,
      eventType: "menu_item_created",
      eventCategory: "menu",
      description: `Item "${item.name}" creado en categoría "${category.name}"`,
      resourceId: item.id,
      resourceType: "menu_item",
      newValues: item,
    })

    // Actualizar métricas
    await SubscriptionTracker.updateUsageMetrics(user.id, "menu_items_created", params.id)

    return createApiResponse({ item }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Datos inválidos: ${error.errors.map((e) => e.message).join(", ")}`, 400)
    }

    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
