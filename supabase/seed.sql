-- Insert sample data for development
-- This file is optional and only for development/testing

-- Sample profiles (these will be created automatically when users sign up)
-- But we can insert some test data

-- Sample restaurants
INSERT INTO public.restaurants (id, owner_id, name, slug, description, phone, address, hours, theme, features) VALUES
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000', -- This should match a real user ID
    'La Pizzería de Mario',
    'la-pizzeria-de-mario',
    'Auténtica cocina italiana en el corazón de la ciudad',
    '+54 9 11 1234-5678',
    'Av. Corrientes 1234, CABA',
    'Lun-Dom: 18:00 - 00:00',
    'clasico',
    '{"wifi": true, "parking": false, "delivery": true, "takeaway": true}'
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440000',
    'Café Central',
    'cafe-central',
    'El mejor café y pastelería de la zona',
    '+54 9 11 5678-1234',
    'Av. Santa Fe 5678, CABA',
    'Lun-Vie: 07:00 - 22:00, Sáb-Dom: 08:00 - 23:00',
    'moderno',
    '{"wifi": true, "parking": true, "delivery": false, "takeaway": true}'
);

-- Sample categories for La Pizzería de Mario
INSERT INTO public.menu_categories (restaurant_id, name, icon, sort_order) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Entradas', '🍕', 1),
('550e8400-e29b-41d4-a716-446655440001', 'Principales', '🥘', 2),
('550e8400-e29b-41d4-a716-446655440001', 'Postres', '🍰', 3),
('550e8400-e29b-41d4-a716-446655440001', 'Bebidas', '🥤', 4);

-- Sample menu items
INSERT INTO public.menu_items (restaurant_id, category_id, name, description, price, is_featured, ingredients, allergens, views, rating) VALUES
-- Entradas
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.menu_categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Entradas'),
    'Pizza Margherita',
    'Tomate, mozzarella, albahaca fresca',
    2500.00,
    true,
    ARRAY['Tomate', 'Mozzarella', 'Albahaca', 'Aceite de oliva'],
    ARRAY['Gluten', 'Lácteos'],
    156,
    4.8
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.menu_categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Entradas'),
    'Empanadas Criollas',
    'Carne cortada a cuchillo, cebolla, huevo',
    800.00,
    false,
    ARRAY['Carne', 'Cebolla', 'Huevo', 'Aceitunas'],
    ARRAY['Gluten'],
    89,
    4.5
),
-- Principales
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.menu_categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Principales'),
    'Milanesa Napolitana',
    'Con papas fritas caseras',
    3200.00,
    true,
    ARRAY['Carne', 'Pan rallado', 'Tomate', 'Jamón', 'Queso'],
    ARRAY['Gluten', 'Lácteos'],
    234,
    4.9
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.menu_categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Principales'),
    'Bife de Chorizo',
    'Con ensalada mixta',
    4500.00,
    false,
    ARRAY['Carne de res', 'Lechuga', 'Tomate', 'Cebolla'],
    NULL,
    67,
    4.7
),
-- Postres
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.menu_categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Postres'),
    'Tiramisu Casero',
    'Receta tradicional italiana',
    1800.00,
    false,
    ARRAY['Mascarpone', 'Café', 'Cacao', 'Vainillas'],
    ARRAY['Lácteos', 'Huevos', 'Gluten'],
    123,
    4.6
),
-- Bebidas
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.menu_categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Bebidas'),
    'Agua Mineral',
    '500ml',
    500.00,
    false,
    ARRAY['Agua mineral'],
    NULL,
    45,
    4.2
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    (SELECT id FROM public.menu_categories WHERE restaurant_id = '550e8400-e29b-41d4-a716-446655440001' AND name = 'Bebidas'),
    'Vino Tinto de la Casa',
    'Copa - Malbec argentino',
    1200.00,
    true,
    ARRAY['Uva Malbec'],
    NULL,
    78,
    4.5
);
