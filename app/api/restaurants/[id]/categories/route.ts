import type { NextRequest } from "next/server"
import { getAuthenticatedUser, createApiResponse, createErrorResponse } from "@/lib/auth-middleware"
import { categorySchema } from "@/lib/validations"
import { supabase } from "@/lib/supabase"
import { SubscriptionTracker } from "@/lib/subscription-tracking"
import { z } from "zod" // Import zod for ZodError

// GET - Obtener categorías del restaurante
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { data: categories, error } = await supabase
      .from("menu_categories")
      .select(`
        *,
        menu_items (
          id,
          name,
          price,
          is_available
        )
      `)
      .eq("restaurant_id", params.id)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return createErrorResponse("Error al obtener categorías", 500)
    }

    return createApiResponse({ categories: categories || [] })
  } catch (error) {
    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}

// POST - Crear nueva categoría
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const body = await request.json()
    const validatedData = categorySchema.parse(body)

    // Crear la categoría
    const { data: category, error } = await supabase
      .from("menu_categories")
      .insert({
        ...validatedData,
        restaurant_id: params.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      return createErrorResponse("Error al crear categoría", 500)
    }

    // Log de actividad
    await SubscriptionTracker.logUserActivity({
      userId: user.id,
      eventType: "category_created",
      eventCategory: "menu",
      description: `Categoría "${category.name}" creada en ${restaurant.name}`,
      resourceId: category.id,
      resourceType: "category",
      newValues: category,
    })

    // Actualizar métricas
    await SubscriptionTracker.updateUsageMetrics(user.id, "categories_created", params.id)

    return createApiResponse({ category }, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Datos inválidos: ${error.errors.map((e) => e.message).join(", ")}`, 400)
    }

    console.error("Unexpected error:", error)
    return createErrorResponse("Error interno del servidor", 500)
  }
}
