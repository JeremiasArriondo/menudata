import {
  authenticateRequest,
  getClientIP,
  getUserAgent,
} from "@/lib/auth-middleware";
import type { Database } from "@/lib/database.types";
import { categorySchema } from "@/lib/validations";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// GET - Obtener categorías de un restaurante
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    // Verificar que el restaurante pertenece al usuario
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", params.id)
      .eq("owner_id", authResult.user.id)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    const { data: categories, error } = await supabase
      .from("menu_categories")
      .select(
        `
        *,
        menu_items (
          id,
          name,
          price,
          is_available
        )
      `
      )
      .eq("restaurant_id", params.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json(
        { error: "Error al obtener categorías" },
        { status: 500 }
      );
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error in GET /api/restaurants/[id]/categories:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva categoría
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request);
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    // Verificar que el restaurante pertenece al usuario
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", params.id)
      .eq("owner_id", authResult.user.id)
      .single();

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    // Obtener el siguiente sort_order
    const { data: lastCategory } = await supabase
      .from("menu_categories")
      .select("sort_order")
      .eq("restaurant_id", params.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = (lastCategory?.sort_order || 0) + 1;

    const { data: category, error } = await supabase
      .from("menu_categories")
      .insert({
        restaurant_id: params.id,
        ...validatedData,
        sort_order: validatedData.sort_order || nextSortOrder,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return NextResponse.json(
        { error: "Error al crear categoría" },
        { status: 500 }
      );
    }

    // Log de actividad
    await supabase.rpc("log_user_activity", {
      p_user_id: authResult.user.id,
      p_event_type: "category_created",
      p_event_category: "menu",
      p_description: `Categoría "${category.name}" creada`,
      p_resource_id: category.id,
      p_resource_type: "category",
      p_metadata: {
        restaurant_id: params.id,
        category_name: category.name,
        ip_address: getClientIP(request),
        user_agent: getUserAgent(request),
      },
    });

    // Actualizar métricas
    await supabase.rpc("update_usage_metrics", {
      p_user_id: authResult.user.id,
      p_restaurant_id: params.id,
      p_metric_type: "categories_created",
      p_increment: 1,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/restaurants/[id]/categories:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
