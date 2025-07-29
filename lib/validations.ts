import { z } from "zod"

// Validación para restaurante
export const restaurantSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "Nombre muy largo"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .max(50, "Slug muy largo")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().max(500, "Descripción muy larga").optional(),
  phone: z.string().max(20, "Teléfono muy largo").optional(),
  address: z.string().max(200, "Dirección muy larga").optional(),
  hours: z.string().max(100, "Horarios muy largos").optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  theme: z.enum(["clasico", "moderno", "elegante", "colorido", "rustico", "premium"]).default("clasico"),
  logo_url: z.string().url("URL de logo inválida").optional(),
  features: z.record(z.any()).default({}),
})

// Validación para categoría
export const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(50, "Nombre muy largo"),
  icon: z.string().max(50, "Icono muy largo").default("🍽️"),
  sort_order: z.number().int().min(0).default(0),
})

// Validación para item de menú
export const menuItemSchema = z.object({
  category_id: z.string().uuid("ID de categoría inválido"),
  name: z.string().min(1, "El nombre es requerido").max(100, "Nombre muy largo"),
  description: z.string().max(500, "Descripción muy larga").optional(),
  price: z.number().min(0, "El precio debe ser positivo"),
  image_url: z.string().url("URL de imagen inválida").optional(),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  is_featured: z.boolean().default(false),
  is_available: z.boolean().default(true),
  sort_order: z.number().int().min(0).default(0),
})

// Validación para actualización de item
export const updateMenuItemSchema = menuItemSchema.partial().omit({ category_id: true })

// Validación para actualización de restaurante
export const updateRestaurantSchema = restaurantSchema.partial().omit({ slug: true })
