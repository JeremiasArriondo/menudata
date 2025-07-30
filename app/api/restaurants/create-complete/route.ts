import type { Database } from "@/lib/database.types";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

// Schema para validar el menú completo
const completeMenuSchema = z.object({
  restaurant: z.object({
    name: z.string().min(1, "El nombre del restaurante es requerido"),
    description: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    theme: z.string().default("clasico"),
  }),
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      icon: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          price: z.number(),
          featured: z.boolean().default(false),
        })
      ),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = completeMenuSchema.parse(body);

    // Generar slug único
    const baseSlug = validatedData.restaurant.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    let slug = baseSlug;
    let counter = 1;

    // Verificar que el slug sea único
    while (true) {
      const { data: existingRestaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("slug", slug)
        .single();

      if (!existingRestaurant) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Crear el restaurante
    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .insert({
        owner_id: user.id,
        name: validatedData.restaurant.name,
        slug: slug,
        description: validatedData.restaurant.description || "",
        phone: validatedData.restaurant.phone || "",
        address: validatedData.restaurant.address || "",
        theme: validatedData.restaurant.theme,
        is_active: true,
        features: {
          wifi: false,
          parking: false,
          delivery: false,
          takeaway: false,
        },
      })
      .select()
      .single();

    if (restaurantError) {
      console.error("Error creating restaurant:", restaurantError);
      return NextResponse.json(
        { error: "Error al crear el restaurante" },
        { status: 500 }
      );
    }

    // Crear las categorías y sus items
    for (const [
      categoryIndex,
      category,
    ] of validatedData.categories.entries()) {
      if (category.items.length === 0) continue; // Skip empty categories

      // Crear la categoría
      const { data: createdCategory, error: categoryError } = await supabase
        .from("menu_categories")
        .insert({
          restaurant_id: restaurant.id,
          name: category.name,
          icon: category.icon,
          sort_order: categoryIndex + 1,
        })
        .select()
        .single();

      if (categoryError) {
        console.error("Error creating category:", categoryError);
        continue;
      }

      // Crear los items de la categoría
      const itemsToInsert = category.items.map((item, itemIndex) => ({
        category_id: createdCategory.id,
        name: item.name,
        description: item.description,
        price: item.price,
        is_featured: item.featured,
        is_available: true,
        sort_order: itemIndex + 1,
      }));

      const { error: itemsError } = await supabase
        .from("menu_items")
        .insert(itemsToInsert);

      if (itemsError) {
        console.error("Error creating items:", itemsError);
      }
    }

    // Log de actividad
    await supabase.rpc("log_user_activity", {
      p_user_id: user.id,
      p_event_type: "complete_menu_created",
      p_event_category: "menu",
      p_description: `Menú completo creado para "${restaurant.name}"`,
      p_resource_id: restaurant.id,
      p_resource_type: "restaurant",
      p_metadata: {
        restaurant_name: restaurant.name,
        theme: restaurant.theme,
        categories_count: validatedData.categories.filter(
          (cat) => cat.items.length > 0
        ).length,
        items_count: validatedData.categories.reduce(
          (acc, cat) => acc + cat.items.length,
          0
        ),
      },
    });

    return NextResponse.json({
      success: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        theme: restaurant.theme,
      },
      message: "Menú creado exitosamente",
    });
  } catch (error) {
    console.error("Error in POST /api/restaurants/create-complete:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
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
