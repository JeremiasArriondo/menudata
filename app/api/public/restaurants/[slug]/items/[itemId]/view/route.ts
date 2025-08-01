import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getClientIP, getUserAgent } from "@/lib/auth-middleware"
import type { Database } from "@/lib/database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// POST - Incrementar vistas de un item
export async function POST(request: NextRequest, { params }: { params: { slug: string; itemId: string } }) {
  try {
    // Verificar que el item existe y pertenece al restaurante
    const { data: item, error: itemError } = await supabase
      .from("menu_items")
      .select(`
        id,
        restaurant_id,
        restaurants!inner (
          slug
        )
      `)
      .eq("id", params.itemId)
      .eq("restaurants.slug", params.slug)
      .eq("is_available", true)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "Item no encontrado" }, { status: 404 })
    }

    // Incrementar vistas usando la función de la base de datos
    const { error: viewError } = await supabase.rpc("increment_item_views", {
      item_uuid: params.itemId,
    })

    if (viewError) {
      console.error("Error incrementing views:", viewError)
      return NextResponse.json({ error: "Error al registrar vista" }, { status: 500 })
    }

    // Registrar analytics
    try {
      await supabase.from("menu_analytics").insert({
        restaurant_id: item.restaurant_id,
        item_id: params.itemId,
        event_type: "item_view",
        user_agent: getUserAgent(request),
        ip_address: getClientIP(request),
        referrer: request.headers.get("referer"),
      })
    } catch (analyticsError) {
      console.error("Error logging item analytics:", analyticsError)
      // No fallar la request por errores de analytics
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST /api/public/restaurants/[slug]/items/[itemId]/view:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
