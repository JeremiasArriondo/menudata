import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const createItemSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  image_url: z.string().url().optional().or(z.literal("")),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.number().default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const restaurantId = params.id;
    const categoryId = params.categoryId;

    console.log(
      "Creating item for restaurant:",
      restaurantId,
      "category:",
      categoryId
    );

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
      console.log("Auth error:", authError);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar que el restaurante pertenece al usuario
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, user_id")
      .eq("id", restaurantId)
      .eq("user_id", user.id)
      .single();

    if (restaurantError || !restaurant) {
      console.log("Restaurant error:", restaurantError);
      return NextResponse.json(
        { error: "Restaurante no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que la categoría pertenece al restaurante
    const { data: category, error: categoryError } = await supabase
      .from("menu_categories")
      .select("id, restaurant_id")
      .eq("id", categoryId)
      .eq("restaurant_id", restaurantId)
      .single();

    if (categoryError || !category) {
      console.log("Category error:", categoryError);
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log("Request body:", body);

    const validatedData = createItemSchema.parse(body);
    console.log("Validated data:", validatedData);

    // Crear el item
    const { data: newItem, error: createError } = await supabase
      .from("menu_items")
      .insert({
        restaurant_id: restaurantId, // Asegurar que se incluya
        category_id: categoryId,
        name: validatedData.name,
        description: validatedData.description || null,
        price: validatedData.price,
        image_url: validatedData.image_url || null,
        is_available: validatedData.is_available,
        is_featured: validatedData.is_featured,
        sort_order: validatedData.sort_order,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating item:", createError);
      return NextResponse.json(
        { error: "Error al crear el item", details: createError.message },
        { status: 500 }
      );
    }

    console.log("Item created successfully:", newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; categoryId: string } }
) {
  try {
    const restaurantId = params.id;
    const categoryId = params.categoryId;

    // Obtener items de la categoría
    const { data: items, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("category_id", categoryId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching items:", error);
      return NextResponse.json(
        { error: "Error al obtener items" },
        { status: 500 }
      );
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
