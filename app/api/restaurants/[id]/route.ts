import {
  authenticateRequest,
  getClientIP,
  getUserAgent,
} from "@/lib/auth-middleware";
import type { Database } from "@/lib/database.types";
import { restaurantSchema } from "@/lib/validations";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// GET - Obtener restaurante específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .select(
        `
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
      `
      )
      .eq("id", params.id)
      .eq("owner_id", authResult.user.id)
      .eq("is_active", true)
      .single();

    if (error || !restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("Error in GET /api/restaurants/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar restaurante
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    console.log("PUT /api/restaurants/[id] - Raw body:", body);

    // Limpiar datos antes de validar - convertir strings vacíos a null
    const cleanedData = {
      ...body,
      description: body.description === "" ? null : body.description,
      phone: body.phone === "" ? null : body.phone,
      address: body.address === "" ? null : body.address,
      hours: body.hours === "" ? null : body.hours,
      website: body.website === "" ? null : body.website,
    };

    console.log("PUT /api/restaurants/[id] - Cleaned data:", cleanedData);

    // Validar solo los campos que se están enviando
    const validatedData = restaurantSchema.partial().parse(cleanedData);
    console.log("PUT /api/restaurants/[id] - Validated data:", validatedData);

    // Verificar propiedad
    const { data: existingRestaurant } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", params.id)
      .eq("owner_id", authResult.user.id)
      .single();

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    // Si se está cambiando el slug, verificar que no exista
    if (validatedData.slug && validatedData.slug !== existingRestaurant.slug) {
      const { data: slugExists } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", validatedData.slug)
        .neq("id", params.id)
        .single();

      if (slugExists) {
        return NextResponse.json(
          { error: "El slug ya está en uso" },
          { status: 400 }
        );
      }
    }

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("owner_id", authResult.user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating restaurant:", error);
      return NextResponse.json(
        { error: "Error al actualizar restaurante" },
        { status: 500 }
      );
    }

    console.log("PUT /api/restaurants/[id] - Updated restaurant:", restaurant);

    // Log de actividad
    await supabase.rpc("log_user_activity", {
      p_user_id: authResult.user.id,
      p_event_type: "restaurant_updated",
      p_event_category: "restaurant",
      p_description: `Restaurante "${restaurant.name}" actualizado`,
      p_resource_id: restaurant.id,
      p_resource_type: "restaurant",
      p_old_values: existingRestaurant,
      p_new_values: restaurant,
      p_metadata: {
        ip_address: getClientIP(request),
        user_agent: getUserAgent(request),
      },
    });

    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("Error in PUT /api/restaurants/[id]:", error);
    if (error instanceof Error && error.name === "ZodError") {
      console.error("Zod validation error details:", error);
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: error.message,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar restaurante
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Verificar propiedad
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", params.id)
      .eq("owner_id", authResult.user.id)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    // Soft delete
    const { error } = await supabase
      .from("restaurants")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("owner_id", authResult.user.id);

    if (error) {
      console.error("Error deleting restaurant:", error);
      return NextResponse.json(
        { error: "Error al eliminar restaurante" },
        { status: 500 }
      );
    }

    // Log de actividad
    await supabase.rpc("log_user_activity", {
      p_user_id: authResult.user.id,
      p_event_type: "restaurant_deleted",
      p_event_category: "restaurant",
      p_description: `Restaurante "${restaurant.name}" eliminado`,
      p_resource_id: restaurant.id,
      p_resource_type: "restaurant",
      p_metadata: {
        restaurant_name: restaurant.name,
        ip_address: getClientIP(request),
        user_agent: getUserAgent(request),
      },
    });

    return NextResponse.json({
      message: "Restaurante eliminado correctamente",
    });
  } catch (error) {
    console.error("Error in DELETE /api/restaurants/[id]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
