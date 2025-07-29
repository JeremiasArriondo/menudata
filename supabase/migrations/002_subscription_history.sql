-- Crear tabla de historial de suscripciones
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    
    -- Información del evento
    event_type TEXT NOT NULL CHECK (event_type IN (
        'subscription_created',
        'subscription_upgraded', 
        'subscription_downgraded',
        'subscription_cancelled',
        'subscription_renewed',
        'subscription_paused',
        'subscription_resumed',
        'payment_succeeded',
        'payment_failed',
        'trial_started',
        'trial_ended'
    )),
    from_plan TEXT,
    to_plan TEXT,
    
    -- Detalles financieros
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
    
    -- Información adicional
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Información del sistema
    ip_address INET,
    user_agent TEXT,
    source TEXT DEFAULT 'web',
    
    -- Timestamps
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de eventos de usuario (acciones generales)
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Información del evento
    event_type TEXT NOT NULL,
    event_category TEXT NOT NULL CHECK (event_category IN (
        'auth', 'menu', 'subscription', 'profile', 'admin', 'api'
    )),
    
    -- Detalles del evento
    description TEXT,
    resource_id UUID, -- ID del recurso afectado (menu, restaurant, etc.)
    resource_type TEXT, -- 'restaurant', 'menu_item', 'category', etc.
    
    -- Datos adicionales
    old_values JSONB, -- Valores anteriores (para updates)
    new_values JSONB, -- Valores nuevos (para updates)
    metadata JSONB DEFAULT '{}',
    
    -- Información del sistema
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de métricas de uso
CREATE TABLE IF NOT EXISTS public.usage_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    
    -- Métricas por período
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    
    -- Contadores de uso
    menu_views INTEGER DEFAULT 0,
    menu_items_created INTEGER DEFAULT 0,
    menu_items_updated INTEGER DEFAULT 0,
    categories_created INTEGER DEFAULT 0,
    qr_downloads INTEGER DEFAULT 0,
    menu_shares INTEGER DEFAULT 0,
    
    -- Límites del plan
    plan_limit_items INTEGER,
    plan_limit_restaurants INTEGER,
    current_items_count INTEGER DEFAULT 0,
    current_restaurants_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, restaurant_id, period_start, period_type)
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON public.subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_event_type ON public.subscription_history(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON public.subscription_history(created_at);

CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_event_category ON public.user_activity_log(event_category);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at);

CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON public.usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON public.usage_metrics(period_start, period_end);

-- Habilitar RLS
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscription_history
CREATE POLICY "Users can view own subscription history" ON public.subscription_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscription history" ON public.subscription_history
    FOR INSERT WITH CHECK (true);

-- Políticas RLS para user_activity_log
CREATE POLICY "Users can view own activity log" ON public.user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert activity log" ON public.user_activity_log
    FOR INSERT WITH CHECK (true);

-- Políticas RLS para usage_metrics
CREATE POLICY "Users can view own usage metrics" ON public.usage_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage usage metrics" ON public.usage_metrics
    FOR ALL WITH CHECK (true);

-- Trigger para updated_at en usage_metrics
CREATE TRIGGER update_usage_metrics_updated_at BEFORE UPDATE ON public.usage_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para registrar cambios de suscripción
CREATE OR REPLACE FUNCTION public.log_subscription_change(
    p_user_id UUID,
    p_subscription_id UUID DEFAULT NULL,
    p_event_type TEXT DEFAULT 'subscription_updated',
    p_from_plan TEXT DEFAULT NULL,
    p_to_plan TEXT DEFAULT NULL,
    p_amount DECIMAL DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    history_id UUID;
BEGIN
    INSERT INTO public.subscription_history (
        user_id,
        subscription_id,
        event_type,
        from_plan,
        to_plan,
        amount,
        reason,
        metadata
    ) VALUES (
        p_user_id,
        p_subscription_id,
        p_event_type,
        p_from_plan,
        p_to_plan,
        p_amount,
        p_reason,
        p_metadata
    ) RETURNING id INTO history_id;
    
    RETURN history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar actividad del usuario
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_category TEXT,
    p_description TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_resource_type TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.user_activity_log (
        user_id,
        event_type,
        event_category,
        description,
        resource_id,
        resource_type,
        old_values,
        new_values,
        metadata
    ) VALUES (
        p_user_id,
        p_event_type,
        p_event_category,
        p_description,
        p_resource_id,
        p_resource_type,
        p_old_values,
        p_new_values,
        p_metadata
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para actualizar métricas de uso
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
    CASE p_metric_type
        WHEN 'menu_views' THEN
            UPDATE public.usage_metrics 
            SET menu_views = menu_views + p_increment, updated_at = NOW()
            WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
            AND period_start = current_period_start AND period_type = 'monthly';
        WHEN 'menu_items_created' THEN
            UPDATE public.usage_metrics 
            SET menu_items_created = menu_items_created + p_increment, updated_at = NOW()
            WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
            AND period_start = current_period_start AND period_type = 'monthly';
        WHEN 'menu_items_updated' THEN
            UPDATE public.usage_metrics 
            SET menu_items_updated = menu_items_updated + p_increment, updated_at = NOW()
            WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
            AND period_start = current_period_start AND period_type = 'monthly';
        WHEN 'categories_created' THEN
            UPDATE public.usage_metrics 
            SET categories_created = categories_created + p_increment, updated_at = NOW()
            WHERE user_id = p_user_id AND restaurant_id = p_restaurant_id 
            AND period_start = current_period_start AND period_type = 'monthly';
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar contadores automáticamente
CREATE OR REPLACE FUNCTION public.update_current_counts() RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar contador de restaurantes
    UPDATE public.usage_metrics 
    SET current_restaurants_count = (
        SELECT COUNT(*) FROM public.restaurants WHERE owner_id = NEW.owner_id
    )
    WHERE user_id = NEW.owner_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_items_count() RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar contador de items
    UPDATE public.usage_metrics 
    SET current_items_count = (
        SELECT COUNT(*) FROM public.menu_items mi 
        JOIN public.restaurants r ON mi.restaurant_id = r.id 
        WHERE r.owner_id = (
            SELECT owner_id FROM public.restaurants WHERE id = NEW.restaurant_id
        )
    )
    WHERE user_id = (
        SELECT owner_id FROM public.restaurants WHERE id = NEW.restaurant_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
DROP TRIGGER IF EXISTS trigger_update_restaurant_count ON public.restaurants;
CREATE TRIGGER trigger_update_restaurant_count
    AFTER INSERT OR DELETE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.update_current_counts();

DROP TRIGGER IF EXISTS trigger_update_items_count ON public.menu_items;
CREATE TRIGGER trigger_update_items_count
    AFTER INSERT OR DELETE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION public.update_items_count();

-- Trigger para registrar cambios en suscripciones
CREATE OR REPLACE FUNCTION public.trigger_subscription_history()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM public.log_subscription_change(
            NEW.user_id,
            NEW.id,
            'subscription_created',
            NULL,
            NEW.plan,
            NULL,
            'Suscripción creada'
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.plan != NEW.plan THEN
            PERFORM public.log_subscription_change(
                NEW.user_id,
                NEW.id,
                CASE 
                    WHEN NEW.plan > OLD.plan THEN 'subscription_upgraded'
                    ELSE 'subscription_downgraded'
                END,
                OLD.plan,
                NEW.plan,
                NULL,
                'Cambio de plan'
            );
        END IF;
        
        IF OLD.status != NEW.status THEN
            PERFORM public.log_subscription_change(
                NEW.user_id,
                NEW.id,
                CASE NEW.status
                    WHEN 'canceled' THEN 'subscription_cancelled'
                    WHEN 'active' THEN 'subscription_resumed'
                    ELSE 'status_changed'
                END,
                NULL,
                NULL,
                NULL,
                'Cambio de estado: ' || NEW.status
            );
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger a la tabla subscriptions
CREATE TRIGGER subscription_history_trigger
    AFTER INSERT OR UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.trigger_subscription_history();

-- Trigger para registrar actividad en restaurantes
CREATE OR REPLACE FUNCTION public.trigger_restaurant_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
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
        
        -- Actualizar métricas
        PERFORM public.update_usage_metrics(NEW.owner_id, NEW.id, 'restaurants_created', 1);
        
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

-- Aplicar trigger a la tabla restaurants
CREATE TRIGGER restaurant_activity_trigger
    AFTER INSERT OR UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.trigger_restaurant_activity();

-- Trigger para registrar actividad en menu items
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
        
        -- Actualizar métricas
        PERFORM public.update_usage_metrics(restaurant_owner_id, NEW.restaurant_id, 'menu_items_created', 1);
        
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

-- Aplicar trigger a la tabla menu_items
CREATE TRIGGER menu_item_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION public.trigger_menu_item_activity();
