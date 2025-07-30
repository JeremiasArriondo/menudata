-- Corregir la función que tiene el problema con CASE
CREATE OR REPLACE FUNCTION public.update_usage_metrics(
    p_user_id UUID,
    p_restaurant_id UUID DEFAULT NULL,
    p_metric_type TEXT DEFAULT 'menu_views',
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
    current_period_start TIMESTAMPTZ;
    current_period_end TIMESTAMPTZ;
BEGIN
    -- Calcular período actual (mensual)
    current_period_start := date_trunc('month', NOW());
    current_period_end := current_period_start + INTERVAL '1 month';
    
    -- Insertar o actualizar métricas
    INSERT INTO public.usage_metrics (
        user_id,
        restaurant_id,
        period_start,
        period_end,
        period_type
    ) VALUES (
        p_user_id,
        p_restaurant_id,
        current_period_start,
        current_period_end,
        'monthly'
    ) ON CONFLICT (user_id, restaurant_id, period_start, period_type) 
    DO NOTHING;
    
    -- Actualizar la métrica específica
    IF p_metric_type = 'menu_views' THEN
        UPDATE public.usage_metrics 
        SET menu_views = menu_views + p_increment, updated_at = NOW()
        WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
        AND period_start = current_period_start AND period_type = 'monthly';
    ELSIF p_metric_type = 'menu_items_created' THEN
        UPDATE public.usage_metrics 
        SET menu_items_created = menu_items_created + p_increment, updated_at = NOW()
        WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
        AND period_start = current_period_start AND period_type = 'monthly';
    ELSIF p_metric_type = 'menu_items_updated' THEN
        UPDATE public.usage_metrics 
        SET menu_items_updated = menu_items_updated + p_increment, updated_at = NOW()
        WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
        AND period_start = current_period_start AND period_type = 'monthly';
    ELSIF p_metric_type = 'categories_created' THEN
        UPDATE public.usage_metrics 
        SET categories_created = categories_created + p_increment, updated_at = NOW()
        WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
        AND period_start = current_period_start AND period_type = 'monthly';
    ELSIF p_metric_type = 'restaurants_created' THEN
        UPDATE public.usage_metrics 
        SET updated_at = NOW()
        WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
        AND period_start = current_period_start AND period_type = 'monthly';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simplificar el trigger de restaurantes para evitar problemas
CREATE OR REPLACE FUNCTION public.trigger_restaurant_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Solo registrar actividad, sin métricas complejas por ahora
        PERFORM public.log_user_activity(
            NEW.owner_id,
            'restaurant_created',
            'menu',
            'Restaurante creado: ' || NEW.name,
            NEW.id,
            'restaurant',
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.log_user_activity(
            NEW.owner_id,
            'restaurant_updated',
            'menu',
            'Restaurante actualizado: ' || NEW.name,
            NEW.id,
            'restaurant',
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Simplificar el trigger de menu items
CREATE OR REPLACE FUNCTION public.trigger_menu_item_activity()
RETURNS TRIGGER AS $$
DECLARE
    restaurant_owner_id UUID;
BEGIN
    -- Obtener el owner_id del restaurante
    SELECT owner_id INTO restaurant_owner_id 
    FROM public.restaurants 
    WHERE id = COALESCE(NEW.restaurant_id, OLD.restaurant_id);
    
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_user_activity(
            restaurant_owner_id,
            'menu_item_created',
            'menu',
            'Plato creado: ' || NEW.name,
            NEW.id,
            'menu_item',
            NULL,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.log_user_activity(
            restaurant_owner_id,
            'menu_item_updated',
            'menu',
            'Plato actualizado: ' || NEW.name,
            NEW.id,
            'menu_item',
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_user_activity(
            restaurant_owner_id,
            'menu_item_deleted',
            'menu',
            'Plato eliminado: ' || OLD.name,
            OLD.id,
            'menu_item',
            to_jsonb(OLD),
            NULL
        );
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar triggers existentes si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Corregir función de logging si existe
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_category TEXT DEFAULT 'general',
  p_description TEXT DEFAULT '',
  p_resource_id UUID DEFAULT NULL,
  p_resource_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_activity_log (
    user_id,
    event_type,
    event_category,
    description,
    resource_id,
    resource_type,
    metadata
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_category,
    p_description,
    p_resource_id,
    p_resource_type,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurar que las tablas tengan RLS habilitado
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para restaurants
DROP POLICY IF EXISTS "Users can view their own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can create their own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurants" ON public.restaurants;
DROP POLICY IF EXISTS "Anyone can view active restaurants" ON public.restaurants;

CREATE POLICY "Users can view their own restaurants" ON public.restaurants
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own restaurants" ON public.restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view active restaurants" ON public.restaurants
  FOR SELECT USING (is_active = true);

-- Políticas RLS para menu_categories
DROP POLICY IF EXISTS "Users can manage categories of their restaurants" ON public.menu_categories;
DROP POLICY IF EXISTS "Anyone can view categories of active restaurants" ON public.menu_categories;

CREATE POLICY "Users can manage categories of their restaurants" ON public.menu_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view categories of active restaurants" ON public.menu_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.restaurants 
      WHERE id = restaurant_id AND is_active = true
    )
  );

-- Políticas RLS para menu_items
DROP POLICY IF EXISTS "Users can manage items of their restaurants" ON public.menu_items;
DROP POLICY IF EXISTS "Anyone can view items of active restaurants" ON public.menu_items;

CREATE POLICY "Users can manage items of their restaurants" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.menu_categories mc
      JOIN public.restaurants r ON mc.restaurant_id = r.id
      WHERE mc.id = category_id AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view items of active restaurants" ON public.menu_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.menu_categories mc
      JOIN public.restaurants r ON mc.restaurant_id = r.id
      WHERE mc.id = category_id AND r.is_active = true
    )
  );

-- Políticas RLS para profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
