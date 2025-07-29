-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE plan_type AS ENUM ('free', 'intermediate', 'premium');
CREATE TYPE menu_theme AS ENUM ('clasico', 'moderno', 'elegante', 'colorido', 'rustico', 'premium');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    plan plan_type DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE public.restaurants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    phone TEXT,
    address TEXT,
    hours TEXT,
    website TEXT,
    theme menu_theme DEFAULT 'clasico',
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    features JSONB DEFAULT '{"wifi": false, "parking": false, "delivery": false, "takeaway": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu categories table
CREATE TABLE public.menu_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '🍽️',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE public.menu_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    ingredients TEXT[],
    allergens TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE public.menu_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE NOT NULL,
    item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'view', 'click', 'share', etc.
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    plan plan_type NOT NULL,
    status TEXT NOT NULL, -- 'active', 'canceled', 'past_due', etc.
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_restaurants_owner_id ON public.restaurants(owner_id);
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX idx_menu_categories_restaurant_id ON public.menu_categories(restaurant_id);
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_analytics_restaurant_id ON public.menu_analytics(restaurant_id);
CREATE INDEX idx_menu_analytics_created_at ON public.menu_analytics(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for restaurants
CREATE POLICY "Restaurant owners can manage their restaurants" ON public.restaurants
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view active restaurants" ON public.restaurants
    FOR SELECT USING (is_active = true);

-- RLS Policies for menu categories
CREATE POLICY "Restaurant owners can manage their categories" ON public.menu_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.restaurants 
            WHERE id = restaurant_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view active categories" ON public.menu_categories
    FOR SELECT USING (
        is_active = true AND 
        EXISTS (
            SELECT 1 FROM public.restaurants 
            WHERE id = restaurant_id AND is_active = true
        )
    );

-- RLS Policies for menu items
CREATE POLICY "Restaurant owners can manage their menu items" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.restaurants 
            WHERE id = restaurant_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can view available menu items" ON public.menu_items
    FOR SELECT USING (
        is_available = true AND 
        EXISTS (
            SELECT 1 FROM public.restaurants 
            WHERE id = restaurant_id AND is_active = true
        )
    );

-- RLS Policies for analytics
CREATE POLICY "Restaurant owners can view their analytics" ON public.menu_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.restaurants 
            WHERE id = restaurant_id AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert analytics" ON public.menu_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON public.menu_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment menu item views
CREATE OR REPLACE FUNCTION public.increment_item_views(item_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.menu_items 
    SET views = views + 1 
    WHERE id = item_uuid;
    
    INSERT INTO public.menu_analytics (restaurant_id, item_id, event_type)
    SELECT restaurant_id, item_uuid, 'view'
    FROM public.menu_items 
    WHERE id = item_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
