import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const { itemId } = params

    if (!itemId) {
      return NextResponse.json({ error: "Item ID es requerido" }, { status: 400 })
    }

    // Incrementar el contador de vistas usando la función de la base de datos
    const { error } = await supabase.rpc("increment_item_views", {
      item_uuid: itemId,
    })

    if (error) {
      console.error("Error incrementing views:", error)
      return NextResponse.json({ error: "Error al incrementar vistas" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in view increment API:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
