import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const updateItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor a 0").optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  is_available: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } }
) {
  try {
    const restaurantId = params.id;
    const categoryId = params.categoryId;
    const itemId = params.itemId;

    // Verificar autenticación
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Verificar token con Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar que el item pertenece al usuario
    const { data: item, error: itemError } = await supabase
      .from("menu_items")
      .select(
        `
        id,
        restaurant_id,
        category_id,
        restaurants!inner(user_id)
      `
      )
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId)
      .eq("category_id", categoryId)
      .eq("restaurants.user_id", user.id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateItemSchema.parse(body);

    // Actualizar el item
    const { data: updatedItem, error: updateError } = await supabase
      .from("menu_items")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", itemId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating item:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar el item" },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } }
) {
  try {
    const restaurantId = params.id;
    const categoryId = params.categoryId;
    const itemId = params.itemId;

    // Verificar autenticación
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token requerido" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // Verificar token con Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar que el item pertenece al usuario
    const { data: item, error: itemError } = await supabase
      .from("menu_items")
      .select(
        `
        id,
        restaurant_id,
        category_id,
        restaurants!inner(user_id)
      `
      )
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId)
      .eq("category_id", categoryId)
      .eq("restaurants.user_id", user.id)
      .single();

    if (itemError || !item) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el item
    const { error: deleteError } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      console.error("Error deleting item:", deleteError);
      return NextResponse.json(
        { error: "Error al eliminar el item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Item eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } }
) {
  try {
    const restaurantId = params.id;
    const categoryId = params.categoryId;
    const itemId = params.itemId;

    // Obtener el item específico
    const { data: item, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", itemId)
      .eq("restaurant_id", restaurantId)
      .eq("category_id", categoryId)
      .single();

    if (error || !item) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
