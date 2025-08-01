import { z } from "zod";

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre es muy largo"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .max(50, "El slug es muy largo")
    .regex(
      /^[a-z0-9-]+$/,
      "El slug solo puede contener letras minúsculas, números y guiones"
    ),
  description: z
    .string()
    .max(500, "La descripción es muy larga")
    .optional()
    .nullable(),
  phone: z.string().max(20, "El teléfono es muy largo").optional().nullable(),
  address: z
    .string()
    .max(200, "La dirección es muy larga")
    .optional()
    .nullable(),
  hours: z.string().max(100, "El horario es muy largo").optional().nullable(),
  website: z
    .string()
    .max(100, "El sitio web es muy largo")
    .optional()
    .nullable()
    .or(z.literal("")),
  theme: z.enum([
    "clasico",
    "moderno",
    "elegante",
    "colorido",
    "rustico",
    "premium",
  ]),
  features: z
    .object({
      wifi: z.boolean().optional(),
      parking: z.boolean().optional(),
      delivery: z.boolean().optional(),
      takeaway: z.boolean().optional(),
    })
    .optional()
    .nullable(),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre es muy largo"),
  icon: z.string().max(10, "El icono es muy largo").optional(),
  sort_order: z.number().int().min(0).optional(),
});

export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre es muy largo"),
  description: z
    .string()
    .max(500, "La descripción es muy larga")
    .optional()
    .nullable(),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  image_url: z
    .string()
    .url("URL de imagen inválida")
    .optional()
    .nullable()
    .or(z.literal("")),
  ingredients: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_available: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
});
