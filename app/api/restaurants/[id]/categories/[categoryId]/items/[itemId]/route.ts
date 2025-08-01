import {
  authenticateRequest,
  getClientIP,
  getUserAgent,
} from "@/lib/auth-middleware";
import type { Database } from "@/lib/database.types";
import { menuItemSchema } from "@/lib/validations";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// GET - Obtener item específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { data: item, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", params.itemId)
      .eq("category_id", params.categoryId)
      .single();

    if (error || !item) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el restaurante pertenece al usuario
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("owner_id")
      .eq("id", params.id)
      .single();

    if (!restaurant || restaurant.owner_id !== authResult.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error(
      "Error in GET /api/restaurants/[id]/categories/[categoryId]/items/[itemId]:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } }
) {
  try {
    console.log("PUT request received:", {
      restaurantId: params.id,
      originalCategoryId: params.categoryId,
      itemId: params.itemId,
    });

    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    // Validar datos del item
    const validatedData = menuItemSchema.partial().parse(body);
    console.log("Validated data:", validatedData);

    // Verificar que el restaurante pertenece al usuario
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("owner_id")
      .eq("id", params.id)
      .single();

    if (!restaurant || restaurant.owner_id !== authResult.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificar que el item existe en la categoría original
    const { data: existingItem } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", params.itemId)
      .eq("category_id", params.categoryId)
      .single();

    if (!existingItem) {
      console.log("Item not found in original category");
      return NextResponse.json(
        { error: "Item no encontrado en la categoría original" },
        { status: 404 }
      );
    }

    console.log("Existing item found:", existingItem);

    // Si se está cambiando la categoría, verificar que la nueva categoría existe
    if (
      validatedData.category_id &&
      validatedData.category_id !== params.categoryId
    ) {
      const { data: newCategory } = await supabase
        .from("menu_categories")
        .select("id")
        .eq("id", validatedData.category_id)
        .eq("restaurant_id", params.id)
        .single();

      if (!newCategory) {
        return NextResponse.json(
          { error: "Nueva categoría no encontrada" },
          { status: 400 }
        );
      }

      console.log("Moving item to new category:", validatedData.category_id);
    }

    // Actualizar el item
    const { data: updatedItem, error } = await supabase
      .from("menu_items")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.itemId)
      .select()
      .single();

    if (error) {
      console.error("Error updating item:", error);
      return NextResponse.json(
        { error: "Error al actualizar item" },
        { status: 500 }
      );
    }

    console.log("Item updated successfully:", updatedItem);

    // Log de actividad
    await supabase.rpc("log_user_activity", {
      p_user_id: authResult.user.id,
      p_event_type: "menu_item_updated",
      p_event_category: "menu",
      p_description: `Item "${updatedItem.name}" actualizado`,
      p_resource_id: updatedItem.id,
      p_resource_type: "menu_item",
      p_old_values: existingItem,
      p_new_values: updatedItem,
      p_metadata: {
        restaurant_id: params.id,
        category_id: updatedItem.category_id,
        ip_address: getClientIP(request),
        user_agent: getUserAgent(request),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(
      "Error in PUT /api/restaurants/[id]/categories/[categoryId]/items/[itemId]:",
      error
    );
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string; itemId: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Verificar que el restaurante pertenece al usuario
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("owner_id")
      .eq("id", params.id)
      .single();

    if (!restaurant || restaurant.owner_id !== authResult.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Verificar que el item existe
    const { data: existingItem } = await supabase
      .from("menu_items")
      .select("*")
      .eq("id", params.itemId)
      .eq("category_id", params.categoryId)
      .single();

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el item
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", params.itemId);

    if (error) {
      console.error("Error deleting item:", error);
      return NextResponse.json(
        { error: "Error al eliminar item" },
        { status: 500 }
      );
    }

    // Log de actividad
    await supabase.rpc("log_user_activity", {
      p_user_id: authResult.user.id,
      p_event_type: "menu_item_deleted",
      p_event_category: "menu",
      p_description: `Item "${existingItem.name}" eliminado`,
      p_resource_id: existingItem.id,
      p_resource_type: "menu_item",
      p_metadata: {
        restaurant_id: params.id,
        category_id: params.categoryId,
        item_name: existingItem.name,
        ip_address: getClientIP(request),
        user_agent: getUserAgent(request),
      },
    });

    return NextResponse.json({ message: "Item eliminado correctamente" });
  } catch (error) {
    console.error(
      "Error in DELETE /api/restaurants/[id]/categories/[categoryId]/items/[itemId]:",
      error
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
