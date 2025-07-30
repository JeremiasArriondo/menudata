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
